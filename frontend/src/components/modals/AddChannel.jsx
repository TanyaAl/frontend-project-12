import { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Modal, Form, FormGroup, FormControl, Button } from 'react-bootstrap';
import getAuthHeader from '../../../utils/auth';
import axios from 'axios';
import { getChannelValidation } from '../../../utils/validation';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import profanityFilter from '../../../utils/profanityFilter';

const Add = ({ onClose }) => {
  const inputEl = useRef(null);
  const { channels } = useSelector((state) => state.channelsReducer);
  const { t } = useTranslation();
  const names = channels.map((channel) => channel.name);
  const validationSchema = getChannelValidation(t, names);

  useEffect(() => {
    inputEl.current.focus();
  }, [onClose]);
  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log('VALUES', values);
      const newChannel = { name: profanityFilter.clean(values.name) };
      try {
        await axios.post('/api/v1/channels', newChannel, {
          headers: getAuthHeader(),
        });
        toast.success(t('toastify.addChannelSuccess'));
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error(`${t('network')}: ${error}`);
        toast.error(t('network'));
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const isSubmitDisabled = formik.values.name.trim() === '';
  console.log('ISDISABLES', isSubmitDisabled);

  return (
    <div>
      <Modal centered show onHide={onClose} backdrop={true} keyboard={true}>
        <Modal.Header closeButton>
          <Modal.Title>{t('interface_texts.modals.addChannel')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={formik.handleSubmit}>
            <FormGroup>
              <FormControl
                name="name"
                value={formik.values.name}
                onChange={(e) => {
                  formik.setFieldTouched('name', true, false);
                  formik.handleChange(e);
                }}
                required
                data-testid="input-name"
                ref={inputEl}
                onBlur={formik.handleBlur}
                isInvalid={formik.errors.name}
              />
              {formik.errors.name ? (
                <FormControl.Feedback type="invalid">
                  {formik.errors.name}
                </FormControl.Feedback>
              ) : null}
            </FormGroup>
            <div className="d-flex justify-content-end">
              <Button
                onClick={() => onClose()}
                className="btn btn-secondary me-3 mt-3"
              >
                {t('interface_texts.modals.btnDiscard')}
              </Button>
              <Button
                type="submit"
                className="btn btn-primary mt-3"
                disabled={isSubmitDisabled}
              >
                {t('interface_texts.modals.btnSend')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default Add;
