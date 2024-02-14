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
                    (select quiz,name,grade,quiz.max_grade,weight,deadline from quiz join quiz_answers on quiz.id=quiz_answers.quiz where student=%s) as tb1 \
                    group by tb1.quiz,tb1.name,tb1.max_grade,weight,tb1.deadline'
        args = (request.form['user'],)
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
                result[i]=(result[i][0],0,-1.0,result[i][2],result[i][3],)

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