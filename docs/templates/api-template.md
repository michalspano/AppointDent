## \<Service_Name\>

Brief description of the service.

- `API`
  - [REST API](#rest-api)
    - [Endpoint X](#REPLACE)
    - [Endpoint Y](#REPLACE)
    - [Endpoint Z](#REPLACE)
  - [MQTT](#mqtt)
    - [Topic X](#REPLACE) 
    - [Topic Y](#REPLACE)
    - [Topic Z](#REPLACE)

### REST API

#### `<HTTP_METHOD> /api/path/to/endpoint`

- **Description:** 
  Brief description of what this endpoint does.
  Mention any protection rules that apply to this branch.

- **Query Parameters**:
  - `<param_name>` (type or allowed values): Description.
  - `default`: `<default_value>`

- **Cookies:** 
  - `<cookie_name>`: Description. 

- **Example Request:**

```http
<METHOD> <URL>/<PATH>?<QUERY_PARAMS>
```

- **Request Body:**
  ```json
  {
    "key1": "value1"
  }
  ```

- **Response:**
  ```json
  {
    "key2": "value2"
  }
  ```

---

### MQTT

#### `<SOME_TOPIC>`

- **Description:** 
  Brief description of what this topic is used for.

- **Message Format:**
  ```txt
  <message/format>
  ```
- **QoS:** `<QoS>`

#### `<SOME_RESPONSE_TOPIC>`

- **Description:** 
  Brief description of the response.

- **Response Message Format:**
  ```txt
  <message/format>
  ```
- **QoS:** `<QoS>`
