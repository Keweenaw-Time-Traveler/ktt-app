import React from 'react';
import { Formik, Form } from 'formik';

const FileUploader = (props) => {
  const handleSubmit = (values) => {
    let data = new FormData();
    data.append('photo1', values.photo1);
  };

  return (
    <div>
      <Formik initialValues={{ photo1: '' }} onSubmit={handleSubmit}>
        {(formProps) => (
          <Form>
            <input
              type="file"
              name="file"
              onChange={(event) => {
                formProps.setFieldValue('photo1', event.target.files[0]);
              }}
            />
            <button type="Submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FileUploader;
