import "./Feedback.scss";
import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import Header from "../Components/header/Header";

/**
 * rating section interface
 * @param question questions to users
 * @param index index of questions in one section
 * @param ratingGroup number array of rating
 * @param rating element in ratingGroup
 * @function onRatingChange
 **/
interface ratingSections {
    question: string;
    index: number;
    ratingGroup: number[];
    rating: number;
    onRatingChange: (index: number, value: number) => void;
}

/**
 * reuse rating section for each section
 * @param question
 * @param ratingGroup
 * @param rating
 * @param onRatingChange
 * @param index
 * @constructor
 */
const RatingSection: React.FC<ratingSections> = ({
    question,
    ratingGroup,
    rating,
    onRatingChange,
    index,
}) => {
    const ratingLabels = ['strongly disagree', 'somewhat disagree', 'neither agree nor disagree',
        'somewhat agree', 'strongly agree', 'not applicable']; //rating label for each rating choice
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

/**
 * feedback section
 * @constructor
 */
const Feedback = () => {
    const history = useHistory();
    const [curSection, setCurSection] = useState(0);
    const [feedback, setFeedback] = useState('');

    /**
     * question group of section A
     */
    const [ratingA, setRatingA] = useState([
        {questions:'I am satisfied with MeTILDA overall.', rating: -1},
        {questions: 'MeTILDA is easy to use.', rating: -1},
        {questions: 'MeTILDA meets my needs for creating Pitch Art.', rating: -1},
        {questions: 'MeTILDA meets my needs to teach pronunciation.', rating: -1}
    ]);

    /**
     * question group of section B
     */
    const [ratingB, setRatingB] = useState([
        {questions: 'MeTILDA is easy to navigate, I know where everything is.', rating: -1},
        {questions: 'If I do not know where something is, it is easy to find.', rating: -1},
        {questions: 'The tabs on top of the page make it obvious where everything is.', rating: -1},
        {questions: 'The names of tools are intuitive to me.', rating: -1}
    ]);

    /**
     * question group of section C
     */
    const [ratingC, setRatingC] = useState([
        {questions: 'Uploading files into MeTILDA is easy.', rating: -1},
        {questions: 'Selecting vowels and pitch to make Pitch Art is simple.', rating: -1},
        {questions: 'It is easy to create a Pitch Art.', rating: -1},
        {questions: 'It is easy to make Pitch Art look how I want.', rating: -1}
    ]);

    /**
     * updates ratingA array to reflect new rating value for specific question
     * @param index question index in question array
     * @param value new rating value the user selects for the question
     */
    const handleSectionAChange = (index: number, value: number) => {
        const newRating = [...ratingA];
        newRating[index].rating = value;
        setRatingA(newRating);
    }

    /**
     * updates ratingB array to reflect new rating value for specific question
     * @param index question index in question array
     * @param value new rating value the user selects for the question
     */
    const handleSectionBChange = (index: number, value: number) => {
        const newRating = [...ratingB];
        newRating[index].rating = value;
        setRatingB(newRating);
    }

    /**
     * updates ratingC array to reflect new rating value for specific question
     * @param index question index in question array
     * @param value new rating value the user selects for the question
     */
    const handleSectionCChange = (index: number, value: number) => {
        const newRating = [...ratingC];
        newRating[index].rating = value;
        setRatingC(newRating);
    }

    /**
     * recording and handle change of feedback text area
     * @param event
     */
    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(event.target.value);
    };

    /**
     * rating sections
     * define each section in feedback form
     */
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

    /**
     * define last section to identify if current section is the last one
     */
    const lastSection = curSection === sections.length - 1;

    /**
     * define previous button
     * one click to switch to previous section
     */
    const previous = () => {
        if (curSection > 0) {
            setCurSection(curSection - 1);
        }
    }

    /**
     * define next button
     * one click to switch to the next section
     * if it is the last section, go to ThankYou page
     */
    const next = () => {
        if (curSection < sections.length - 1) {
            setCurSection(curSection + 1);
        }
        else {
            history.push('/ThankYou');
        }
    }

    /**
     * the progress bar show on the bottom of page
     * @param curSection
     * @param totalSections
     * @constructor
     */
    const ProgressBar = ({curSection, totalSections}) => {
        const progress = (curSection / (totalSections - 1)) * 100;
        return (
            <div className="progressbar">
                <div className="progressbar-inner" style={{width: `${progress}%`}}></div>
            </div>
        );
    };

    /**
     * handle submission button
     * use console.log() to debug
     * one click to switch to ThankYou page
     * @param event
     */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log(feedback);
        history.push("/ThankYou");
    };

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
