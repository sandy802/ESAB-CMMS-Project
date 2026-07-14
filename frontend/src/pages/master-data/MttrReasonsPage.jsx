// pages/master-data/MttrReasonsPage.jsx
import SimpleListPage from './SimpleListPage';

const CONFIG = {
  apiPath:     '/mttr-reasons',
  title:       'MTTR Reasons',
  singular:    'MTTR Reason',
  subtitle:    'Reasons that explain repair delays — used in ticket close form',
  fieldLabel:  'MTTR Reason Name',
  placeholder: 'e.g. Spare Part Delay',
};

const MttrReasonsPage = () => <SimpleListPage config={CONFIG} />;

export default MttrReasonsPage;