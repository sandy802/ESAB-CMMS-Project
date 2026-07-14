// pages/master-data/RootCausesPage.jsx
import SimpleListPage from './SimpleListPage';

const CONFIG = {
  apiPath:     '/root-causes',
  title:       'Root Causes',
  singular:    'Root Cause',
  subtitle:    'Root causes selected when closing a ticket',
  fieldLabel:  'Root Cause Name',
  placeholder: 'e.g. Bearing Failure',
};

const RootCausesPage = () => <SimpleListPage config={CONFIG} />;

export default RootCausesPage;