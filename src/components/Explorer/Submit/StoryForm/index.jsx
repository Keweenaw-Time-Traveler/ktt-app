import React, { useState } from 'react';
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
      .required('Timeframe is required'),
    story: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Story text is required'),
    file1: Yup.mixed(),
    file2: Yup.mixed(),
    file3: Yup.mixed(),
    signature: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!'),
  });

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
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          console.log(JSON.stringify(values, null, 2));
        }}
      >
        {({ errors, values, handleSubmit, setFieldValue }) => {
          return (
            <Form className="story-form">
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
