const peopleSchema = {
  people: {
    1: {
      first: 'John',
      last: 'Abrahamson',
      middle: 'A',
      dob: '2/14/1900',
      records: {
        1: {
          type: 'census',
          date: '1920',
          address: '1234 Main Street, Laurium, MI',
          lat: '47.239120',
          lon: '-88.442860',
          occupation: 'Laborer',
          source: '1920 Keweenaw Census',
        },
        2: {
          type: 'birth_certificate',
          date: '1900',
          address: '1234 Main Street, Laurium, MI',
          lat: '47.239120',
          lon: '-88.442860',
          occupation: 'na',
          source: 'Keweenaw 1900 Clerks Office',
        },
      },
    },
  },
};
