
const defaultSalesContacts = [
  {
    id: 1,
    company: "Metro Logistics",
    contact: "John Smith",
    stage: "Demo",
    lastTouch: "2024-02-15",
    type: "Logistics",
    nextFollowUp: "2024-02-22",
    notes: []
  },
  {
    id: 2,
    company: "TechManufacturing Inc",
    contact: "Sarah Johnson",
    stage: "Lead",
    lastTouch: "2024-02-14",
    type: "Manufacturing",
    nextFollowUp: "2024-02-21",
    notes: []
  }
];

export function loadSalesData() {
  const stored = localStorage.getItem('salesContacts');
  return stored ? JSON.parse(stored) : defaultSalesContacts;
}

export function saveSalesData(contacts) {
  localStorage.setItem('salesContacts', JSON.stringify(contacts));
}

export function updateSalesContact(id, updates) {
  const contacts = loadSalesData();
  const updatedContacts = contacts.map(contact => 
    contact.id === id ? { ...contact, ...updates } : contact
  );
  saveSalesData(updatedContacts);
  return updatedContacts;
}

export function addFollowUpNote(id, note) {
  const contacts = loadSalesData();
  const updatedContacts = contacts.map(contact => {
    if (contact.id === id) {
      return {
        ...contact,
        notes: [...contact.notes, { text: note, timestamp: new Date().toISOString() }],
        lastTouch: new Date().toISOString().split('T')[0]
      };
    }
    return contact;
  });
  saveSalesData(updatedContacts);
  return updatedContacts;
}

export function updateContactPerson(id, newContact) {
  const contacts = loadSalesData();
  const updatedContacts = contacts.map(contact => {
    if (contact.id === id) {
      return { ...contact, contact: newContact };
    }
    return contact;
  });
  saveSalesData(updatedContacts);
  return updatedContacts;
}

export function closeLostAccount(id) {
  const contacts = loadSalesData();
  const updatedContacts = contacts.map(contact => {
    if (contact.id === id) {
      return { ...contact, stage: "Closed Lost" };
    }
    return contact;
  });
  saveSalesData(updatedContacts);
  return updatedContacts;
}
