from flask import request, jsonify
from metilda import app
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/student-view/grades', methods=["POST"])
def student_grades():
    with Postgres() as connection:
        res={}

        query = 'select assignments.id,name,grade,assignments.max_grade,weight from assignments join assignment_submissions\
            on assignments.id=assignment_submissions.assignment where user_id=%s and course=%s'
        args = (request.form['user'],request.form['course'])
        result = connection.execute_select_query(query, args)
        if result:
            res['assignments']=list(map(lambda arr:{
                    'assignment':arr[0],
                    'name':arr[1],
                    'grade':arr[2],
                    'max_grade':arr[3],
                    'weight':arr[4]
                },result))
        else:
            res['assignments']=[]

        query = 'select tb1.quiz,tb1.name,sum(tb1.grade),tb1.max_grade,weight,tb1.deadline from \
                    (select quiz,name,grade,quiz.max_grade,weight,deadline from quiz join quiz_answers on quiz.id=quiz_answers.quiz where student=%s and course=%s) as tb1 \
                    group by tb1.quiz,tb1.name,tb1.max_grade,weight,tb1.deadline'
        args = (request.form['user'],request.form['course'])
        result = connection.execute_select_query(query, args)
        if result:
            for i in range(len(result)):
                if datetime.strptime(result[i][5][5:-4],'%d %b %Y %H:%M:%S') > datetime.utcnow():
                    result[i]=(result[i][0],result[i][1],-1.0,result[i][3],result[i][4],result[i][5],)
            res['quiz']=list(map(lambda arr:{
                'quiz':arr[0],
                'name':arr[1],
                'grade':arr[2],
                'max_grade':arr[3],
                'weight':arr[4],
                'deadline':arr[5]
            },result))
        else:
            res['quiz']=[]

        query = 'select gradables.id,name,grade,gradables.max_grade,weight from gradables join gradable_grades on gradables.id=gradable_grades.gradable_id\
            where user_id=%s and course=%s'
        args = (request.form['user'],request.form['course'])
        result=connection.execute_select_query(query, args)
        if result:
            res['gradables']=list(map(lambda arr:{
                'gradable':arr[0],
                'name':arr[1],
                'grade':arr[2],
                'max_grade':arr[3],
                'weight':arr[4]
            },result))
        else:
            res['gradables']=[]

        return jsonify(res)

@app.route('/student-view/other_grades', methods=["POST"])
def get_other_grades():
    # Get the user's course input
    course_id = request.form['course']
    current_user_email = request.form.get("user")  # Email of the logged-in user

    with Postgres() as connection:
        
        # Fetch other items for the course
        query = '''
        SELECT g.id, g.name, g.created_at, g.max_grade, g.weight
        FROM gradables g
        WHERE g.course = %s 
        AND g.name NOT IN (
            SELECT name FROM quiz WHERE course = %s
            UNION
            SELECT name FROM assignments WHERE course = %s
        )
        '''
        args = (request.form['course'], request.form['course'], request.form['course'])
        others = connection.execute_select_query(query, args)

        if not others:
            return jsonify({"error": "No other items found for this course"}), 404

        # Extract other items IDs
        other_ids = tuple(other[0] for other in others)

        if not other_ids:
            return jsonify({"error": "No valid other items IDs found"}), 404

        # Fetch grades for these other items using IN clause
        grades_query = '''
            SELECT gradable_id, grade, user_id
            FROM gradable_grades 
            WHERE gradable_id IN %s
        '''
        grades = connection.execute_select_query(grades_query, (other_ids,))

        if not grades:
            return jsonify({"error": "No grades found for other items"}), 404

        # Organize grades by other items ID
        other_scores = {}
        for gradable_id, grade, user_id in grades:
            if grade != -1:  # Ignore invalid grades
                if gradable_id not in other_scores:
                    other_scores[gradable_id] = []
                other_scores[gradable_id].append((grade, user_id))

        # Prepare the result with additional metrics
        result = []
        gradable_ids = {gradable_id for gradable_id, _, _ in grades}
        for other in others:
            other_id, name, created_at, max_grade, weight = other
            if other_id in gradable_ids:
                scores = [score for score, _ in other_scores.get(other_id, [])]

                user_grade=0
                
                # Calculate metrics if there are valid scores
                if scores:
                    lowest_score = min(scores)
                    average_score = sum(scores) / len(scores)
                    highest_score = max(scores)

                    # Calculate the current user's percentile if email is provided
                    user_grade = next(
                        (grade for grade, uid in other_scores.get(other_id, []) if uid == current_user_email),
                        None
                    )

                    if user_grade is not None:
                        sorted_scores = sorted(scores)
                        percentile_rank = (sorted_scores.index(user_grade) / len(sorted_scores)) * 100
                    else:
                        percentile_rank = None
                else:
                    lowest_score = average_score = highest_score = percentile_rank = None

                # Add other item details to the result
                result.append({
                    'other_id': other_id,
                    'name': name,
                    'created_at': created_at,
                    'user_grade': round(user_grade, 2) if user_grade is not None else None,
                    'max_grade': round(max_grade, 2) if max_grade is not None else None,
                    'weight': round(weight, 2) if weight is not None else None,
                    'lowest_score': round(lowest_score, 2) if lowest_score is not None else None,
                    'average_score': round(average_score, 2) if average_score is not None else None,
                    'highest_score': round(highest_score, 2) if highest_score is not None else None,
                    'percentile': round(percentile_rank, 2) if percentile_rank is not None else None
                })
    return jsonify(result)

    
@app.route('/student-view/grades/stats', methods=["POST"])
def student_grades_stats():
    with Postgres() as connection:
        stats=[]

        query = 'select assignments.id,grade from assignments join assignment_submissions\
            on assignments.id=assignment_submissions.assignment where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)

        sums={}
        graded={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=record[1]
                    graded[record[0]]+=1
            else:
                if record[1]!=-1:
                    sums[record[0]]=record[1]
                    graded[record[0]]=1

        averages={key:val/graded[key] for key,val in sums.items() if key in graded}


        sums={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=(record[1]-averages[record[0]])**2
            else:
                if record[1]!=-1:
                    sums[record[0]]=(record[1]-averages[record[0]])**2
        stds={key:(val/graded[key])**0.5 for key,val in sums.items() if key in graded}

        query = 'select gradables.id,grade from gradables join gradable_grades on gradables.id=gradable_grades.gradable_id\
            where course=%s'
        args = (request.form['course'],)
        result=connection.execute_select_query(query, args)

        sums={}
        graded={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=record[1]
                    graded[record[0]]+=1
            else:
                if record[1]!=-1:
                    sums[record[0]]=record[1]
                    graded[record[0]]=1

        averages2={key:val/graded[key] for key,val in sums.items() if key in graded}

        sums={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=(record[1]-averages2[record[0]])**2
            else:
                if record[1]!=-1:
                    sums[record[0]]=(record[1]-averages2[record[0]])**2
        stds2={key:(val/graded[key])**0.5 for key,val in sums.items() if key in graded}



        query = 'select quiz.id,sum(grade),student,quiz.deadline from quiz join quiz_answers on quiz.id=quiz_answers.quiz where course=%s group by quiz.id,student'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)

        for i in range(len(result)):
            if datetime.strptime(result[i][3][5:-4],'%d %b %Y %H:%M:%S') > datetime.utcnow():
                result[i]=(result[i][0],0,result[i][2],result[i][3],)

        sums={}
        graded={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=record[1]
                    graded[record[0]]+=1
            else:
                if record[1]!=-1:
                    sums[record[0]]=record[1]
                    graded[record[0]]=1

        averages3={key:val/graded[key] for key,val in sums.items() if key in graded}


        sums={}
        for record in result:
            if record[0] in sums:
                if record[1]!=-1:
                    sums[record[0]]+=(record[1]-averages3[record[0]])**2
            else:
                if record[1]!=-1:
                    sums[record[0]]=(record[1]-averages3[record[0]])**2
        stds3={key:(val/graded[key])**0.5 for key,val in sums.items() if key in graded}


        return jsonify({
            'assignment_averages':averages,
            'assignment_stds':stds,
            'gradable_averages':averages2,
            'gradable_stds':stds2,
            'quiz_averages':averages3,
            'quiz_stds':stds3,
        })