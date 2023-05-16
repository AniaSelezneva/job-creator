const technicians = {
  Tampa: ["Sergei Petrov", "Irina Ivanova", "Dmitry Sokolov"],
  Miami: ["Anna Smirnova", "Alexei Volkov", "Elena Kuznetsova"],
  Orlando: ["Andrei Popov", "Natalia Petrova", "Vladimir Ivanov"],
  Houston: ["Yulia Sokolova", "Mikhail Volkov", "Svetlana Ivanova"],
  Charlotte: ["Pavel Smirnov", "Ekaterina Popova", "Denis Petrov"],
  Austin: ["Marina Ivanova", "Nikolai Sokolov", "Olga Smirnova"],
};
const fields = {
  address: "a744153a8fa5d34eff0a698786ab2866912a923b",
  area: "0f81e388825720ed30a06d69bc5f662b8dcda6d7",
  jobType: "e4aa353a5979d4e06d4cc36fc2aa60dad8c434f1",
  jobSource: "c1d49ab9971246f33a1b6fe78da3715945e4a809",
  jobComment: "dd1c79107c6fe2b8f564ac306ef25c097f5ba989",
  date: "1be3516dccedbe20aa053aac33f3ce4d5fd339a5",
  startTime: "211049d1172ba60c03da2177b69182ffaa06b1d6",
  endTime: "e03388238cc3991f846cfd63c6742eebeac28730",
  technician: "20ec037bdf5547521ff5f30357416f392ce0845b",
  tampaTechnician: "d4016f34ab7d82be2f7ba003a8a2ef2c8d22ed88",
  miamiTechnician: "094df32d7622aabc04c434fb044f5dbebcc1a63f",
  orlandoTechician: "c35922966770271e415e40f8ae909fd28c657162",
  houstonTechnician: "ec8d71ac7324cba0b672c337bf531100ea8a3d5b",
  charlotteTechnician: "7012e3a03e4ace7d71715522e12addabcb62f499",
  austinTechnician: "9302e99be8a6b22ccd41f124672b15bf0f92a4f9",
};

const apiToken = "feb0b3900e4a5a13eb82510bd9312ecc69171379";

const technicianSelect = document.getElementById("technician");
const jobSourceSelect = document.getElementById("jobSource");
const addressInput = document.getElementById("address");
const spinner = document.getElementById("spinner");
const submitButton = document.getElementById("submit");
let jobSource = jobSourceSelect.value;

let personId;
const dealId = getDealIdFromURL();

function getDealIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get("selectedIds");
  return dealId;
}

const getArea = (jobSource) => {
  return jobSource.replace(/^GL\s/, "");
};

const populateTechnicians = () => {
  jobSource = jobSourceSelect.value;
  const area = getArea(jobSource);
  const techniciansInArea = technicians[area];

  // Clear previous options
  technicianSelect.innerHTML = "";

  if (techniciansInArea) {
    // Populate options based on selected area
    techniciansInArea.forEach((technician) => {
      const option = document.createElement("option");
      option.value = technician;
      option.textContent = technician;
      technicianSelect.appendChild(option);
    });
  } else {
    const defaultText = "Select technician";
    const option = document.createElement("option");
    option.textContent = defaultText;
    technicianSelect.appendChild(option);
  }
};

const formatAddress = (address, city, state, zipCode) => {
  return `${address}, ${city}, ${state} ${zipCode}, USA`;
};

const createPerson = async (event) => {
  event.preventDefault();

  // Get form values
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  const name = `${firstName} ${lastName}`;
  const personData = {
    name: name,
    first_name: firstName,
    last_name: lastName,
    phone: phone,
  };

  // Conditionally add email if it exists
  if (email) {
    personData.email = email;
  }

  const response = await fetch(
    `https://api.pipedrive.com/v1/persons?api_token=${apiToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(personData),
    }
  );

  const person = await response.json();

  if (response.ok) {
    console.log("Person created successfully.");
    addressInput.focus();
    personId = person.data.id;
  } else {
    const errorMessage = person.error;
    console.error(`Failed to create person. Error: ${errorMessage}`);
  }

  // Switch event listener of the button
  // Now it doesn't create a person
  // but adds details to the deal instead
  submitButton.removeEventListener("click", createPerson);
  submitButton.textContent = "Create job";
  submitButton.addEventListener("click", addDetails);
};

const addDetails = async (event) => {
  event.preventDefault();

  const address = addressInput.value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const zipCode = document.getElementById("zipcode").value;
  const area = document.getElementById("area").value;

  const jobType = document.getElementById("jobType").value;
  const jobDescription = document.getElementById("jobDescription").value;

  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const technician = technicianSelect.value;

  // Show spinner
  spinner.style.display = "flex";

  const formattedAddress = formatAddress(address, city, state, zipCode);

  const details = {
    person_id: personId,
    [fields.address]: formattedAddress,
    [fields.area]: area,
    [fields.jobType]: jobType,
    [fields.jobSource]: jobSource,
    [fields.jobComment]: jobDescription,
    [fields.date]: date,
    [fields.startTime]: startTime,
    [fields.endTime]: endTime,
  };

  const key = `${getArea(jobSource).toLowerCase()}Technician`;
  details[fields[key]] = technician;

  const response = await fetch(
    `https://api.pipedrive.com/v1/deals/${dealId}?api_token=${apiToken}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    }
  );

  if (response.ok) {
    console.log("Details added to the deal successfully.");
  } else {
    const errorMessage = response.error;
    console.error(`Failed to add details to the deal. Error: ${errorMessage}`);
  }

  // Hide spinner
  spinner.style.display = "none";

  // Show link to the updated deal instead of the form
  const dealLink = document.createElement("a");
  dealLink.href = `https://anna-sandbox3.pipedrive.com/deal/${dealId}`;
  dealLink.textContent = "View deal";
  dealLink.target = "_blank";

  // Show the link to the updated deal instead of the form
  const bodyElement = document.body;
  const textNode = document.createTextNode("Job is created! ");
  bodyElement.innerHTML = ""; // Clear the form content
  bodyElement.appendChild(textNode);
  bodyElement.appendChild(dealLink);
};

jobSourceSelect.addEventListener("change", populateTechnicians);
submitButton.addEventListener("click", createPerson);

// Initialize SDK, resize the iFrame window
(async function () {
  const sdk = await new AppExtensionsSDK().initialize();
  await sdk.execute("resize", { height: 740, width: 840 });
})();
