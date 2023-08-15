const newPartyForm = document.querySelector('#new-party-form');
const partyContainer = document.querySelector('#party-container');

const PARTIES_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/parties';
const GUESTS_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/guests';
const RSVPS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/rsvps';
const GIFTS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/gifts';

// get all parties
const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
  }
};

// get single party by id
const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    const party = await response.json();
    return party;
  } catch (error) {
    console.error(error);
  }
};

// delete party
const deleteParty = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      console.log(`Party with ID ${id} deleted successfully.`);
    } else {
      console.error(`Failed to delete party with ID ${id}`);
    }
  } catch (error) {
    console.error(error);
  }

};

// render a single party by id
const renderSinglePartyById = async (id) => {
  try {
    // fetch party details from server
    const party = await getPartyById(id);

    // GET - /api/workshop/guests/party/:partyId - get guests by party id
    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    const guests = await guestsResponse.json();

    // GET - /api/workshop/rsvps/party/:partyId - get RSVPs by partyId
    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    const rsvps = await rsvpsResponse.json();

    // GET - get all gifts by party id - /api/workshop/parties/gifts/:partyId -BUGGY?
    // const giftsResponse = await fetch(`${PARTIES_API_URL}/party/gifts/${id}`);
    // const gifts = await giftsResponse.json();

    // create new HTML element to display party details
    const partyDetailsElement = document.createElement('div');
    partyDetailsElement.classList.add('party-details');
    partyDetailsElement.innerHTML = `
            <h2 id="party-name">${party.name} Details</h2>
            <ul class="party">
            <li>${party.description}</li>
            <li><span class="bold">Date:</span> ${party.date}</li>
            <li><span class="bold">Time:</span> ${party.time}</li>
            <li><span class="bold">Location:</span> ${party.location}</li>
            </ul>
            <h3>Guests:</h3>
            <ul class="guest-list">
            ${guests
              .map(
                (guest, index) => `
              <li>
                <div class="guest">${guest.name}</div>
                <div class="guest">${rsvps[index].status}</div>
              </li>
            `
              )
              .join('')}
          </ul>
          


            <button class="close-button">Close</button>
        `;
    partyContainer.appendChild(partyDetailsElement);

    // add event listener to close button
    const closeButton = partyDetailsElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      partyDetailsElement.remove();
    });
  } catch (error) {
    console.error(error);
  }
};

// render all parties
const renderParties = async (parties) => {
  try {
    partyContainer.innerHTML = '';
    parties.forEach((party) => {
      const partyElement = document.createElement('div');
      partyElement.classList.add('party');
      partyElement.innerHTML = `
                <h2 id="party-name">${party.name}</h2>
                <ul class="party">
                <li>${party.description}</li>
                <li><span class="bold">Date:</span> ${party.date}</li>
                <li><span class="bold">Time:</span> ${party.time}</li>
                <li><span class="bold">Location:</span> ${party.location}</li>
                </ul>
                <button class="details-button" data-id="${party.id}">See Details</button>
                <button class="delete-button" data-id="${party.id}">Delete</button>
            `;
      partyContainer.appendChild(partyElement);

      // see details
      const detailsButton = partyElement.querySelector('.details-button');
      detailsButton.addEventListener('click', async (event) => {
        const partyId = event.target.getAttribute('data-id');
        await renderSinglePartyById(partyId);
      });

      // delete party
      const deleteButton = partyElement.querySelector('.delete-button');
      deleteButton.addEventListener('click', async (event) => {
        const partyId = event.target.getAttribute('data-id');
        await deleteParty(partyId);
        await renderParties(await getAllParties());
      });
    });
  } catch (error) {
    console.error(error);
  }
};

// init function
const init = async () => {
  try {
    const parties = await getAllParties();
    renderParties(parties);  
  } catch (error) {
    console.error(error);
  }
};

init();
