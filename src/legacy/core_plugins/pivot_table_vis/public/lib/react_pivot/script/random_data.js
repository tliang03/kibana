const _ = require('underscore');
const faker = require('faker');
const xtend = require('xtend');

const nEntries = 60;

const nPeople = 20;
const nFirsts = nPeople / 2;
const nLasts = nPeople / 2;
const nStates = nPeople / 4;
const nTransactionsPerPerson = nEntries / nPeople;
const nCompanies = nEntries / 10;

const firstNames = [];
const lastNames = [];
const states = [];
const companies = [];

for (let i = 0; i < nFirsts; i++) firstNames.push(faker.name.firstName());
for (let i = 0; i < nLasts; i++) lastNames.push(faker.name.lastName());
for (let i = 0; i < nStates; i++) states.push(faker.address.stateAbbr());
for (let i = 0; i < nCompanies; i++) companies.push(faker.company.companyName());

const data = [];

for (let i = 0; i < nPeople; i++) {
  const person = {
    firstName: _.sample(firstNames),
    lastName: _.sample(lastNames),
    state: _.sample(states)
  };

  for (let j = 0; j < nTransactionsPerPerson; j++) {
    const transaction = faker.helpers.createTransaction();
    transaction.business = _.sample(companies);
    data.push(xtend(person, { transaction: transaction }));
  }
}

console.log(JSON.stringify(data, null, 2));
