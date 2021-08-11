import Profile from './Profile';
import ContactProgram from './ContactProgram';
import CreateWell from './Wells/CreateWell';

import CreateOrEditSite from './Sites/CreateOrEditSite';
import AddSiteContacts from './Sites/AddSiteContacts';
import AddSiteLocation from './Sites/AddSiteLocation';

export { SitesAndInventory, GenericLandingPage } from './Home';

const Sites = { CreateOrEditSite, AddSiteContacts, AddSiteLocation };

export { CreateWell, ContactProgram, Profile, Sites };
