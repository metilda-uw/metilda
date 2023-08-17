import "./Feedback.scss";
import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import Header from "../Components/header/Header";

// rating section interface
interface ratingSections {
    question: string;
    index: number;
    ratingGroup: number[];
    rating: number;
    onRatingChange: (index: number, value: number) => void;
}

// create a reuse section for rating
const RatingSection: React.FC<ratingSections> = ({
    question,
    ratingGroup,
    rating,
    onRatingChange,
    index,
}) => {
    const ratingLabels = ['strongly disagree', 'somewhat disagree', 'neither agree nor disagree',
        'somewhat agree', 'strongly agree', 'not applicable'];
    return (
        <div>
            <p className="rating-statements">{index + 1 + '. '}{question}</p>
            <div className=" rating-inputs rating-container">
                {ratingLabels.map((label, valueIndex) =>
                    <label key={label} className="rating-label">
                        {label}
                        <input
                            type="radio"
                            name={`rating-${index}`}
                            value={valueIndex}
                            checked={rating === valueIndex}
                            onChange={() => onRatingChange(index, valueIndex)}
                        />
                        <span className={`${rating === valueIndex ? 'active' : ''}`} />
                    </label>
                )}
            </div>
        </div>
    )
};

const Feedback = () => {
    const history = useHistory();
    const [curSection, setCurSection] = useState(0);

    // section A questions
    // rating: -1 -> remove preselection of radio button
    const [ratingA, setRatingA] = useState([
        {questions:'I am satisfied with MeTILDA overall.', rating: -1},
        {questions: 'MeTILDA is easy to use.', rating: -1},
        {questions: 'MeTILDA meets my needs for creating Pitch Art.', rating: -1},
        {questions: 'MeTILDA meets my needs to teach pronunciation.', rating: -1}
    ]);

    // section B questions
    const [ratingB, setRatingB] = useState([
        {questions: 'MeTILDA is easy to navigate, I know where everything is.', rating: -1},
        {questions: 'If I do not know where something is, it is easy to find.', rating: -1},
        {questions: 'The tabs on top of the page make it obvious where everything is.', rating: -1},
        {questions: 'The names of tools are intuitive to me.', rating: -1}
    ]);

    // section C questions
    const [ratingC, setRatingC] = useState([
        {questions: 'Uploading files into MeTILDA is easy.', rating: -1},
        {questions: 'Selecting vowels and pitch to make Pitch Art is simple.', rating: -1},
        {questions: 'It is easy to create a Pitch Art.', rating: -1},
        {questions: 'It is easy to make Pitch Art look how I want.', rating: -1}
    ]);

    // handle section A change
    const handleSectionAChange = (index: number, value: number) => {
        const newRating = [...ratingA];
        newRating[index].rating = value;
        setRatingA(newRating);
    }

    // handle section B change
    const handleSectionBChange = (index: number, value: number) => {
        const newRating = [...ratingB];
        newRating[index].rating = value;
        setRatingB(newRating);
    }

    // handle section C change
    const handleSectionCChange = (index: number, value: number) => {
        const newRating = [...ratingC];
        newRating[index].rating = value;
        setRatingC(newRating);
    }

    const sections = [
        {
            sectionName: <b className="b">SectionA: Overall Use</b>,
            sectionBody: (
                <div>
                    {ratingA.map((rating, index) => (
                        <RatingSection
                        key={index}
                        index={index}
                        question={rating.questions}
                        ratingGroup={[0,1,2,3,4,5]}
                        rating={rating.rating}
                        onRatingChange={(questionIndex, value) => handleSectionAChange(index, value)}
                        />
                        ))}
                </div>
            ),
        },
        {
            sectionName: <b className="b">SectionB: Navigate</b>,
            sectionBody: (
                <div>
                    {ratingB.map((rating, index) => (
                        <RatingSection
                            key={index}
                            index={index}
                            question={rating.questions}
                            ratingGroup={[0,1,2,3,4,5]}
                            rating={rating.rating}
                            onRatingChange={(questionIndex, value) => handleSectionBChange(index, value)}
                        />
                    ))}
                </div>
            ),
        },
        {
            sectionName: <b className="b">SectionC: Pitch Art Creation</b>,
            sectionBody: (
                <div>
                    {ratingC.map((rating, index) => (
                        <RatingSection
                            key={index}
                            index={index}
                            question={rating.questions}
                            ratingGroup={[0,1,2,3,4,5]}
                            rating={rating.rating}
                            onRatingChange={(questionIndex, value) => handleSectionCChange(index, value)}
                        />
                    ))}
                </div>
            ),
            textArea: (
                <div>

                </div>
            ),
        },
    ];
    const lastSection = curSection === sections.length - 1;

    const previous = () => {
        if (curSection > 0) {
            setCurSection(curSection - 1);
        }
    }

    const next = () => {
        if (curSection < sections.length - 1) {
            setCurSection(curSection + 1);
        }
        else {
            history.push('/ThankYou');
        }
    }

    // feedback text
    const [feedback, setFeedback] = useState('');

    // handle the text feedback change
    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(event.target.value);
    };

    const ProgressBar = ({curSection, totalSections}) => {
        const progress = (curSection / (totalSections - 1)) * 100;
        return (
            <div className="progressbar">
                <div className="progressbar-inner" style={{width: `${progress}%`}}></div>
            </div>
        );
    };

    // handle the submit button
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Do something with the feedback, such as sending it to a server or storing it in a database
        // pass the feedback to the server console for debugging
        console.log(feedback);
        // {
        // ...pass the feedback data to database here
        // }
        // Reset the feedback state
        //setFeedback('');
        history.push("/ThankYou");
    };

    // return the feedback form
    return (
        <div>
            <Header />
            <h3>Evaluation Form</h3>

                <p className="p-intro">
                    While MeTILDA is an ongoing project, the Creat tool is ready for beta. This form ask you to evaluate the
                    usage of MeTILDA overall and the Create tab. Other tools are still being developed but are available
                    to explore.
                </p>
                <p className="p-intro">Feedback is welcome.</p>
            {sections[curSection].sectionName}
            {sections[curSection].sectionBody}
            <div className="nav-buttons">
                <button className="button" onClick={previous} disabled={curSection === 0} >Previous</button>
                <button className="button" onClick={next} disabled={curSection === sections.length-1} >Next</button>
                {!lastSection && <ProgressBar curSection={curSection} totalSections={sections.length} />}
            </div>
            {lastSection && (
                <div>
                    <p className="p-intro"> If you explored other freatures (Collection, Learn, MyAccount, etc.),
                        please gve us any feedback.</p>

                    <b className="b">Please share your suggestions for MeTILDA</b>
                    <div>
                    <textarea
                        value={feedback}
                        onChange={handleFeedbackChange}
                        rows={10}
                        maxLength={600}
                        className="feedback-textarea"
                    />
                        <p>
                            Word count: {feedback.length}/600
                        </p>
                    </div>
                    <button type="submit" className="button" onClick={handleSubmit}>Submit</button>
                    <ProgressBar curSection={curSection} totalSections={sections.length} />
                </div>
            )}
        </div>
    );
};

export default Feedback;
