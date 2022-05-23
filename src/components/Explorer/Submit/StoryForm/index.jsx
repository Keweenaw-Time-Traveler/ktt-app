import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import Thumb from './Thumb';
import * as Yup from 'yup';
import $ from 'jquery';
import './styles.scss';

const StoryForm = (props) => {
  const [fileStatus, setFileStatus] = useState({
    file1: false,
    file2: false,
    file3: false,
  });
  const mapRef = useRef();
  
  if(!props.related) { //sharing general story, get geo locations
    
    console.log(mapRef);
  }
  
  const handleClear = (id) => {
    setFileStatus({ ...fileStatus, [id]: false });
    const input = $(`#file${id}`);
    input.replaceWith(input.val('').clone(true));
  };
  const SignupSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Title is required'),
    time: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Timeframe is required')
      .test('range-check', "'-' means a date range. Please use the format mm/dd/yyyy for dates.", 
            function(value) {
                let response = parseDateEntry(value);
                return (response.valid == false  && response.invalidReason == 'range') ? false : true;
            })
      .test('format-check', "Please enter the date in one of the three suggested formats.", 
            function(value) {
                let response = parseDateEntry(value);
                return (response.valid == false  && response.invalidReason == 'format') ? false : true;
            })
      .test('future-check', "Looks like that date is in the future. Please enter a date in the past.", 
            function(value) {
                let response = parseDateEntry(value);
                return (response.valid == false  && response.invalidReason == 'future') ? false : true;
            }),
    story: Yup.string()
      .min(2, 'Too Short!')
      .max(500, 'Too Long!')
      .required('Story text is required'),
    file1: Yup.mixed(),
    file2: Yup.mixed(),
    file3: Yup.mixed(),
    signature: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!')
  });
  const submitStory = async (event) => {
    console.log('submit handler clicked');
    console.log('from props the id is: ' + props.related);
    console.log(JSON.stringify(event, null, 2));
  }
  
  const parseDateEntry = (dateEntry) => {
    
    const response = {
        valid: false,
        invalidReason: null,
        estimated: true,
        beginDate: null,
        endDate: null,
        accuracyLevel: 0
    }
    if (!dateEntry) {
      response.valid = true;
      return response
    }
    const rangeSymbol = dateEntry.indexOf("-") !== -1 ? "-" : dateEntry.indexOf("-") !== -1 ? "-" : dateEntry.indexOf("-") !== -1 ? "-" : null;
    if (rangeSymbol != null) {
        const rangeParts = dateEntry.split(rangeSymbol);
        if (rangeParts.length != 2) {
            response.invalidReason = "range"
            return response;
        }
        let lhs = rangeParts[0].trim();
        let rhs = rangeParts[1].trim();

        const lhsSlashSplit = lhs.split("/");
        const rhsSlashSplit = rhs.split("/");

        if (lhsSlashSplit.length == 3 && rhsSlashSplit.length == 3) {
            response.estimated = false;
            response.accuracyLevel = 3;
        } else if (lhsSlashSplit.length == 2 && rhsSlashSplit.length == 2) {
            response.accuracyLevel = 2;
        } else {
            response.accuracyLevel = 1;
        }

        if (lhsSlashSplit.length == 2) {
            lhs = lhsSlashSplit[0] + "/01/" + lhsSlashSplit[1];
        }
        if (rhsSlashSplit.length == 2) {
            rhs = rhsSlashSplit[0] + "/01/" + rhsSlashSplit[1];
        }

        const beginDateNum = Date.parse(lhs);
        const endDateNum = Date.parse(rhs);
        if (isNaN(beginDateNum) || isNaN(endDateNum)) {
            response.invalidReason = "format";
            return response;
        } else {
            response.beginDate = new Date(beginDateNum);
            response.endDate = new Date(endDateNum);
        }
        if (beginDateNum > Date.now() || endDateNum > Date.now()) {
            response.invalidReason = "future";
            return response;
        }
    } else {
        const slashSplit = dateEntry.split("/");
        if (slashSplit.length == 3) {
            response.estimated = false;
            response.accuracyLevel = 3;
        } else if (slashSplit.length == 2) {
            dateEntry = slashSplit[0] + "/01/" + slashSplit[1];
            response.accuracyLevel = 2;
        } else {
            response.accuracyLevel = 1;
        }
        const dateNum = Date.parse(dateEntry);
        if (dateNum > Date.now()) {
            response.invalidReason = "future";
            return response;
        }
        if (isNaN(dateNum)) {
            response.invalidReason = "format";
            return response;
        } else {
            response.beginDate = response.endDate = new Date(dateNum);
        }
    }
    if (response.beginDate == null || response.endDate == null) {
        response.invalidReason = "format";
        return response;
    }
    response.valid = true;
    return response;
  }


  return (
    <div className="container">
      <Formik
        initialValues={{
          title: '',
          time: '',
          story: '',
          file1: null,
          file2: null,
          file3: null,
        }}
        validationSchema={SignupSchema}
        onSubmit={submitStory}
      >
        {({ errors, values, handleSubmit, setFieldValue }) => {
          return (
            <Form className={`story-form ${props.show}`}>
              <div className="story-form-group">
                <label htmlFor="title">Story Title</label>
                <Field id="title" name="title" placeholder="Something short" />
                <div className="help">
                  <span className="message">Give your story a title.</span>
                  {errors.title ? (
                    <span className="error">{errors.title}</span>
                  ) : null}
                </div>
              </div>
              <div className="story-form-group">
                <label htmlFor="time">Story Timeframe</label>
                <Field
                  id="time"
                  name="time"
                  placeholder="1922 or 1920-1930 or 05/03/1932"
                  pattern="([0-9][0-9]?\/){0,2}((17|18|19|20)[0-9][0-9])([ \t]*[-—–][ \t]*([0-9][0-9]?\/){0,2}((17|18|19|20)[0-9][0-9]))?"
                />
                <div className="help">
                  <span className="message">When did your story happen?</span>
                  {errors.time ? (
                    <span className="error">{errors.time}</span>
                  ) : null}
                </div>
              </div>
              <div className="story-form-group">
                <label htmlFor="story">Story Text</label>
                <Field
                  id="story"
                  name="story"
                  as="textarea"
                  placeholder="This is the text people will see when viewing your story"
                />
                <div className="help">
                  {errors.story ? (
                    <span className="error">{errors.story}</span>
                  ) : null}
                </div>
              </div>
              <div className="story-form-group">
                <label>Story Attachments</label>
                <div className="help">
                  <span className="message">
                    Up to 3 photos, 10mb max for each.
                  </span>
                </div>
                <div className="attachments">
                  {!fileStatus.file1 && (
                    <input
                      id="file1"
                      name="file1"
                      type="file"
                      onChange={(event) => {
                        const toogle = fileStatus.file1 ? false : true;
                        setFileStatus({ ...fileStatus, file1: toogle });
                        setFieldValue('file1', event.currentTarget.files[0]);
                      }}
                      className="form-control"
                    />
                  )}
                  {errors.file1 ? (
                    <div className="help">
                      <div className="error">{errors.file1}</div>
                    </div>
                  ) : null}
                  {values.file1 && fileStatus.file1 && (
                    <Thumb
                      file={values.file1}
                      clear={() => handleClear('file1')}
                    />
                  )}
                  {!fileStatus.file2 && (
                    <input
                      id="file2"
                      name="file2"
                      type="file"
                      onChange={(event) => {
                        const toogle = fileStatus.file2 ? false : true;
                        setFileStatus({ ...fileStatus, file2: toogle });
                        setFieldValue('file2', event.currentTarget.files[0]);
                      }}
                      className="form-control"
                    />
                  )}
                  {errors.file2 ? (
                    <div className="help">
                      <div className="error">{errors.file2}</div>
                    </div>
                  ) : null}
                  {values.file2 && fileStatus.file2 && (
                    <Thumb
                      file={values.file2}
                      clear={() => handleClear('file2')}
                    />
                  )}
                  {!fileStatus.file3 && (
                    <input
                      id="file3"
                      name="file3"
                      type="file"
                      onChange={(event) => {
                        const toogle = fileStatus.file3 ? false : true;
                        setFileStatus({ ...fileStatus, file3: toogle });
                        setFieldValue('file3', event.currentTarget.files[0]);
                      }}
                      className="form-control"
                    />
                  )}
                  {errors.file3 ? (
                    <div className="help">
                      <div className="error">{errors.file3}</div>
                    </div>
                  ) : null}
                  {values.file3 && fileStatus.file3 && (
                    <Thumb
                      file={values.file3}
                      clear={() => handleClear('file3')}
                    />
                  )}
                </div>
              </div>
              <div className="story-form-group">
                <label htmlFor="time">Your Name</label>
                <Field
                  id="signature"
                  name="signature"
                  placeholder="(optional)"
                />
                <div className="help">
                  <span className="message">
                    Adding your name will help other Keweenaw Time Travelers
                    find you and your story.
                  </span>
                  {errors.signature ? (
                    <span className="error">{errors.signature}</span>
                  ) : null}
                </div>
              </div>
              <div className="notice"><strong>NOTE: This content will be publicly visible on the internet. You won’t be able to update or edit your submission so please double check your entries before submitting. <a href="https://www.keweenawhistory.com/about-sharing-your-stories.html" target="_blank">Learn More</a> about sharing your stories.</strong>
                </div>
              <button type="submit" className="submit-button">
                submit
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default StoryForm;
