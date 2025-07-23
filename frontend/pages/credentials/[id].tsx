import React from 'react';
import { t, Locale } from '../../i18n';

interface Props {
  locale?: Locale;
}

const CredentialPage: React.FC<Props> = ({ locale = 'en' }) => {
  return (
    <div>
      <h1>{t('credentialTitle', locale)}</h1>
      <p>{t('loading', locale)}</p>
    </div>
  );
};

export default CredentialPage;
