export const MeQuery = `query {
  me {
    id
    firstName
    lastName
    access
    receiveNotifications
    profileComplete
  }
}`;

export const AccountMutation = `mutation updateAccount($input: AccountInput!) {
  updateAccount(input: $input) {
    account {
     id
    }
  }
}`;

export const AccountQuery = `query GetAccount($id: Int!) {
  accountById(id: $id) {
    firstName
    lastName
    email
    organization
    phoneNumber
    mailingAddress
    city
    state
    zipCode
    receiveNotifications
    access
  }
}`;

export const ContactQuery = `query SiteById($id: Int!) {
  siteById(id: $id) {
    name
    owner {
      firstName
      lastName
      email
      organization
      phoneNumber
      mailingAddress
      city
      state
      zipCode
    }
    contacts {
      id
      firstName
      lastName
      email
      organization
      phoneNumber
      mailingAddress
      city
      state
      zipCode
      contactType
    }
  }
}`;

export const SitesQuery = `query MySites {
  mySites {
    id
    name
    naicsTitle
  }
}`;

export const SiteMutation = `mutation CreateSite($input: SiteInput!) {
  createSite(input: $input) {
    site {
      id
    }
  }
}`;

export const ContactMutation = `mutation CreateContact($input: ContactInput!) {
  createContact(input: $input) {
    contact {
      id
    }
  }
}`;

export const SiteLocationMutation = `mutation AddLocation($input: SiteLocationInput!) {
  addLocation(input: $input) {
    site {
      id
    }
  }
}`;
