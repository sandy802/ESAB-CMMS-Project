// pages/master-data/BreakdownTypesPage.jsx
import SimpleListPage from './SimpleListPage';

const CONFIG = {
  apiPath:     '/breakdown-types',
  title:       'Breakdown Types',
  singular:    'Breakdown Type',
  subtitle:    'Categories used when logging a machine breakdown',
  fieldLabel:  'Breakdown Type Name',
  placeholder: 'e.g. Electrical Failure',
};

const BreakdownTypesPage = () => <SimpleListPage config={CONFIG} />;

export default BreakdownTypesPage;