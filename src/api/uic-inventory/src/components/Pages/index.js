import Profile from './Profile';
import ContactProgram from './ContactProgram';

import CreateOrEditInventory from './Wells/CreateOrEditInventory';
import AddWells from './Wells/AddWells';
import AddWellDetails from './Wells/AddWellDetails';
import AddSerWellContact from './Wells/AddSerWellContact';
import SubmitInventory from './Wells/SubmitInventory';

import CreateOrEditSite from './Sites/CreateOrEditSite';
import AddSiteContacts from './Sites/AddSiteContacts';
import AddSiteLocation from './Sites/AddSiteLocation';

const Sites = { CreateOrEditSite, AddSiteContacts, AddSiteLocation };
const Wells = { CreateOrEditInventory, AddWells, AddWellDetails, AddSerWellContact, SubmitInventory };

export { SitesAndInventory, GenericLandingPage } from './Home';
export { ContactProgram, Profile, Sites, Wells };
