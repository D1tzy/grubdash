# Custom RESTful API using Express and PostgreSQL

## Capabilities:

- All valid requests return the data in json format, and functions set response status codes where necessary as well.
- Any HTTP request to a route that doesn't have a function defined for that route will automatically return a 'method not allowed' error
- The error function for the route takes in an object as the error with a 'status' and 'message'
- Pre-set values are defined for if one or both is undefined in the error function 
