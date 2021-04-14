[DB Tables - Google Doc](https://docs.google.com/spreadsheets/d/1kBcGiiDpZbhpxYJAISRiu1Ta57z13zNx1jdwm6KrLr8/edit?usp=sharing)
In progress google sheet of columns in each table in the database. Currently includes Census & school records. Adding column types and description. Kind of a schema.

### Grid

5k hexagonal grid made over a large chunk of the Western UP
Right now with about 7,000 points and 4,000 grid cells
It's static and maybe a little slow, but much faster than a live query doing all this joining.
The items being counted are people from the JSON services I sent last month, plus buildings, stories, and places from the live Kett explorer app.
I'd consider this a beta as I just got it working and it's not automated how I'd like, but it should work.

**Definition**

`GET https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KettGridStatsStatic/FeatureServer`
`GET http://geospatialresearch.mtu.edu/grid.php`

**Request Body Arguments**

- `"search": string` what the user entered in the search field
- `"size": number` grid size in km
- `"filters": object`
  - `"date_range": string` if date range selector bar is used
  - `"photos": boolean` should list include results with photos
  - `"featured": boolean` should list include results that are featured
  - `"advanced": object` list of advanced fileters like record type

**Response**

- `200 OK` on success

```json
{
  "active": [
    {
      "id": "1",
      "type": "People",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.2
    },
    {
      "id": "2",
      "type": "People",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.1
    }
  ],
  "in-active": [
    {
      "id": "3",
      "type": "People",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.4
    },
    {
      "id": "4",
      "type": "Everything",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.1
    },
    {
      "id": "5",
      "type": "Everything",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.2
    }
  ]
}
```

### The Grid Cell

What goes in the popup when you click on a grid cell
`Question:` Do we make 1 request for all types or seperate each request?

**Definition**

`GET http://geospatialresearch.mtu.edu/grid_cell.php`

**Request Body Arguments**

- `"id": string` grid id
- `"centroid": object` give lon lat of cell centroid
- `"size": number` cell size in km
- `"filters": object`
  - `"date_range": string` if date range selector bar is used
  - `"photos": boolean` should list include results with photos
  - `"featured": boolean` should list include results that are featured
  - `"advanced": object` list of advanced fileters like record type

**Response**

- `200 OK` on success

```json
{
  "people": [
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, school"
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, home"
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 9, 1920"
    }
  ],
  "places": [
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "title": "JOHNSON HOCKEY ARENA"
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "title": "JOHNSON MINING COMPANY"
    }
  ],
  "stories": [
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "title": "GLADIS JOHNSON was amazing!"
    }
  ]
}
```

### Markers

Used to generate markers based on visible area

**Definition**

`GET http://geospatialresearch.mtu.edu/markers.php`

**Request Body Arguments**

- `"search": string` what the user entered in the search field
- `"area": object` geometry of the area being viewed
- `"filters": object`
  - `"date_range": string` if date range selector bar is used
  - `"photos": boolean` should list include results with photos
  - `"featured": boolean` should list include results that are featured
  - `"advanced": object` list of advanced fileters like record type

**Response**

- `200 OK` on success

```json
{
  "active": {
    "length": 3,
    "people": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    },
    "places": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    },
    "stories": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    }
  },
  "in_active": {
    "length": 3,
    "people": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    },
    "places": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    },
    "stories": {
      "length": 1,
      "results": [
        {
          "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "recnumber": "74917173CENSUS1920",
          "lon": "-9844863.6469",
          "lat": "5982639.7919"
        }
      ]
    }
  }
}
```

### Marker Info

Get info needed for marker popup

**Definition**

`GET http://geospatialresearch.mtu.edu/marker.php`

**Request Body Arguments**

- `"id": string`
- `"filters": object`
  - `"date_range": string` if date range selector bar is used

**Response**

- `200 OK` on success

```json
{
  "people": [
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, school",
      "photos": false,
      "featured": false
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, school",
      "photos": true,
      "featured": false
    }
  ]
}
```

### List

Get info needed for list component

**Definition**

`GET http://geospatialresearch.mtu.edu/list.php`

**Request Body Arguments**

- `"search": string` what the user entered in the search field
- `"area": object` geometry of the area being viewed
- `"filters": object`
  - `"type": string` Everything, People, Place, Stories
  - `"date_range": string` if date range selector bar is used
  - `"photos": boolean` should list include results with photos
  - `"featured": boolean` should list include results that are featured
  - `"advanced": object` list of advanced fileters like record type

**Response**

- `200 OK` on success

```json
{
  "length": 3,
  "results": [
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, school"
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 8, Albion School Grade KA, 1918, home"
    },
    {
      "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
      "recnumber": "74917173CENSUS1920",
      "title": "GLADIS JOHNSON, 9, 1920"
    }
  ]
}
```

### Full Details

Get info needed for full details component

**Definition**

`GET http://geospatialresearch.mtu.edu/full_details.php`

**Request Body Arguments**

- `"id": string`
- `"recnumber": string`

**Response**

- `200 OK` on success

```json
{
  "sources": ["1920 Census MPC", "1940 Census MPC"],
  "active": "1920 Census MPC",
  "archivist": {
    "name": "Chris Marr",
    "email": "chris@monte.net"
  },
  "demographics": [
    { "title": "Occupation", "value": "Laborer" },
    { "title": "Work Place", "value": "Unnamed" },
    { "title": "Birth Place", "value": "Calumet" }
  ],
  "employment_history": [
    { "title": "Occupation", "value": "Laborer" },
    { "title": "Work Place", "value": "Unnamed" },
    { "title": "Birth Place", "value": "Calumet" }
  ],
  "imigration_history": [
    { "title": "Occupation", "value": "Laborer" },
    { "title": "Work Place", "value": "Unnamed" },
    { "title": "Birth Place", "value": "Calumet" }
  ],
  "images": [
    { "url": "http://ktt.com/image1.jpg", "alt": "First image" },
    { "url": "http://ktt.com/image2.jpg", "alt": "Second image" }
  ]
}
```

### Related Content

Get info needed for related content component

**Definition**

`GET http://geospatialresearch.mtu.edu/related_content.php`

**Request Body Arguments**

- `"id": string`
- `"recnumber": string`
  **Response**

- `200 OK` on success

```json
{
  "length": 7,
  "people": {
    "groups": [
      {
        "title": "Family",
        "length": 1,
        "results": [
          {
            "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
            "recnumber": "74917173CENSUS1920",
            "title": "JANE JOHNSON"
          }
        ]
      },
      {
        "title": "Classmates",
        "length": 1,
        "results": [
          {
            "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
            "recnumber": "74917173CENSUS1920",
            "title": "TOM SMITH"
          }
        ]
      }
    ]
  },
  "places": {
    "groups": [
      {
        "title": "Homes",
        "length": 1,
        "results": [
          {
            "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
            "recnumber": "74917173CENSUS1920",
            "title": "Birth Home"
          }
        ]
      },
      {
        "title": "Places of Work",
        "length": 2,
        "results": [
          {
            "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
            "recnumber": "74917173CENSUS1920",
            "title": "Houghton Grocery"
          },
          {
            "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
            "recnumber": "74917173CENSUS1920",
            "title": "Downtown Cafe"
          }
        ]
      }
    ]
  },
  "stories": {
    "length": 2,
    "results": [
      {
        "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
        "recnumber": "74917173CENSUS1920",
        "title": "GLADIS JOHNSON was my grandma!"
      },
      {
        "id": "E4D43ADB-35C6-4981-BF75-358929DD871C",
        "recnumber": "74917173CENSUS1920",
        "title": "GLADIS JOHNSON saved my cat!"
      }
    ]
  }
}
```

### Related Content Grid

Get grid layout based on specific related content

**Definition**

`GET http://geospatialresearch.mtu.edu/grid_related.php`

**Request Body Arguments**

- `"ids": object` list of related content ids
- `"size": number` grid size in km

**Response**

- `200 OK` on success

```json
{
  "results": [
    {
      "id": "1",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.2
    },
    {
      "id": "2",
      "centroid": { "lon": "-9844863.6469", "lat": "5982639.7919" },
      "percent": 0.8
    }
  ]
}
```

### Related Content Markers

Get marker locations based on specific related content

**Definition**

`GET http://geospatialresearch.mtu.edu/markers_related.php`

**Request Body Arguments**

- `"ids": object` list of related content ids

**Response**

- `200 OK` on success

```json
{
  "results": [
    {
      "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
      "recnumber": "74917173CENSUS1920",
      "lon": "-9844863.6469",
      "lat": "5982639.7919"
    },
    {
      "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
      "recnumber": "74917173CENSUS1920",
      "lon": "-9844863.6469",
      "lat": "5982639.7919"
    }
  ]
}
```

### Date Picker

Get info needed render date picker component

**Definition**

`GET http://geospatialresearch.mtu.edu/date_picker.php`

**Request Body Arguments**

- `"area": object` geometry of the area being viewed

**Response**

- `200 OK` on success

```json
{
  "min": 1888,
  "max": 2020,
  "current_location": "Keweenaw",
  "segments": [
    {
      "min": 1888,
      "max": 1902,
      "url": "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_YYYY_FIPS/MapServer"
    },
    {
      "min": 1903,
      "max": 1940,
      "url": "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_YYYY_FIPS/MapServer"
    }
  ]
}
```

### Share a Story

Get info needed render date picker component

**Definition**

`PUT http://geospatialresearch.mtu.edu/share_story.php`

**Request Body Arguments**

- `"title": string`
- `"date": string`
- `"story": string`
- `"images": string`
- `"name": string`
- `"related": object` information needed to relate story to id or record

**Response**

- `200 OK` on success

```json
{
  "message": "Story has been added",
  "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81"
}
```

- `500 Internal Server Error` on server error

```json
{
  "message": "Sorry something went wrong"
}
```

### Print Record

Download a pdf of a record

**Definition**

`PUT http://geospatialresearch.mtu.edu/print.php`

**Request Body Arguments**

- `"id": string`
- `"recnumber": string`

**Response**

- `200 OK` on success

```json
{
  "url": "http://ktt.com/record.pdf"
}
```

### Download Record

Download a csv of a record

**Definition**

`PUT http://geospatialresearch.mtu.edu/download.php`

**Request Body Arguments**

- `"id": string`
- `"recnumber": string`

**Response**

- `200 OK` on success

```json
{
  "url": "http://ktt.com/record.csv"
}
```

### List people

One item for each unique person

**Definition**

`GET http://geospatialresearch.mtu.edu/list_people.php?q=johnson&f=pjson`

**Query Params**

- `"q": string` filter by last name
- `"f": string` responce format, options include json or pjson if you want a more readable output

**Response**

- `200 OK` on success

```json
{
  "results": {
    "people": [
      {
        "person": {
          "personid": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81",
          "namelast": "JOHNSON",
          "namefirst": "WM",
          "birthplace": "MICHIGAN",
          "birthyear": "1884",
          "fbirthplac": "FINLAND",
          "mbirthplac": "FINLAND",
          "personsrc": "1920_census_MPC"
        }
      },
      {
        "person": {
          "personid": "B9E2B070-DD70-42AD-8361-41F7E4802E0D",
          "namelast": "JOHNSON",
          "namefirst": "ELIZABETH",
          "birthplace": "FINLAND",
          "birthyear": "1888",
          "fbirthplac": "FINLAND",
          "mbirthplac": "FINLAND",
          "personsrc": "1920_census_MPC"
        }
      }
    ]
  }
}
```

### Search by Person ID

Multiple entries; one item for each record for each person found

**Definition**

`GET http://geospatialresearch.mtu.edu/search_by_personid.php?q=E4D43ADB-35C6-4981-BF75-358929DD871C&f=pjson`

**Query Params**

- `"q": string` person ID
- `"f": string` responce format, options include json or pjson if you want a more readable output

**Response**

- `200 OK` on success

```json
{
  "results": {
    "records": [
      {
        "record": {
          "personid": "E4D43ADB-35C6-4981-BF75-358929DD871C",
          "lastname": "JOHNSON",
          "firstname": "GLADIS",
          "recyear": "1920",
          "occupation": null,
          "age": "9",
          "addtype": "home",
          "location_type": "Street",
          "address": "Caledonia",
          "lon": "-9844863.6469",
          "lat": "5982639.7919",
          "featoid": "77726",
          "recnumber": "74917173CENSUS1920"
        }
      },
      {
        "record": {
          "personid": "E4D43ADB-35C6-4981-BF75-358929DD871C",
          "lastname": "JOHNSON",
          "firstname": "GLADIS",
          "recyear": "1918",
          "occupation": "Albion School Grade KA",
          "age": "8",
          "addtype": "home",
          "location_type": null,
          "address": "398 Caledonia",
          "lon": "-9844937.4925",
          "lat": "5982580.0083",
          "featoid": "3681",
          "recnumber": "12304SCLRCRD1918"
        }
      },
      {
        "record": {
          "personid": "E4D43ADB-35C6-4981-BF75-358929DD871C",
          "lastname": "JOHNSON",
          "firstname": "GLADIS",
          "recyear": "1918",
          "occupation": "Albion School Grade KA",
          "age": "8",
          "addtype": "school",
          "location_type": null,
          "address": "Albion",
          "lon": "-9844746",
          "lat": "5983037",
          "featoid": "6429",
          "recnumber": "12304SCLRCRD1918"
        }
      }
    ]
  }
}
```

### Search by Person Name

Multiple entries: one item for each record each person found
Can filter by lastname by populating q= lastname, and filter by firstname & lastname by populating q = firstname lastname (currently finishing firstname & lastname function)

**Definition**

`GET http://geospatialresearch.mtu.edu/search_by_personid.php?q=E4D43ADB-35C6-4981-BF75-358929DD871C&f=pjson`

**Query Params**

- `"q": string` person first and/or last name (appears only last name works right now)
- `"f": string` responce format, options include json or pjson if you want a more readable output

**Response**

- `200 OK` on success

```json
{
  "results": {
    "people": [
      {
        "person": {
          "personid": "9C0BFA20-427D-462A-957B-EF797E5EE104",
          "lastname": "JOENANN",
          "firstname": "IRENE",
          "recyear": "1920",
          "occupation": null,
          "age": "19",
          "addtype": "home",
          "location_type": "Enumeration District",
          "address": "173",
          "lon": "-9839031.4306",
          "lat": "5956940.3407",
          "featoid": "61458",
          "recnumber": "74960837CENSUS1920"
        }
      }
    ]
  }
}
```

### Register User

Register new user

**Definition**

`GET http://geospatialresearch.mtu.edu/user_register.php`

**Request Body Arguments**

- `"name": string`
- `"email": string`
- `"password": string`

**Response**

- `200 OK` on success

```json
{
  "message": "New user created!",
  "id": "2D5AD5AE-880C-41BC-BDEE-FF07E5C7DA81"
}
```

- `400 Bad Request` user already exists

```json
{
  "message": "Email already exists"
}
```

- `400 Bad Request` error

```json
{
  "message": "Sorry there was a problem"
}
```

### Login User

Login existing user

**Definition**

`GET http://geospatialresearch.mtu.edu/user_login.php`

**Request Body Arguments**

- `"email": string`
- `"password": string`

**Response**

- `200 OK` on success

```json
{
  "message": "Logged in!",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

- `400 Bad Request` wrong email or password

```json
{
  "message": "Email or password is wrong, please try again"
}
```

### Like

Like a record

**Definition**

`GET http://geospatialresearch.mtu.edu/like.php`

**Request Header Arguments**

- `"auth-token": jwt`

**Request Body Arguments**

- `"id": string`
- `"recnumber": string`

**Response**

- `200 OK` on success

```json
{
  "message": "[Name of record] has been added to your likes!"
}
```

- `401 Unauthorized` not logged in

```json
{
  "message": "Please login to like things"
}
```

### Add to History

Save entry in users history

**Definition**

`GET http://geospatialresearch.mtu.edu/history.php`

**Request Header Arguments**

- `"auth-token": jwt`

**Request Body Arguments**

- `"id": string` user id
- `"entry": object` history info to be saved on user account

**Response**

- `200 OK` on success

```json
{
  "message": "Successfully added to history!"
}
```

- `401 Unauthorized` not logged in

```json
{
  "message": "Please login"
}
```
