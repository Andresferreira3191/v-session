## INSTALL

`npm install v-session`

## USE
```javascript
import V_Session from 'v-session'
Vue.use(V_Session)
```

Now you can use it in your components with the `$v_session` property.

## Reference

- `this.$v_session.gets()`, returns all data stored in the Session.
- `this.$v_session.set(key,value)`, sets a single value to the Session.
- `this.$v_session.get(key)`, returns the value attributed to the given key.
- `this.$v_session.exists()`, checks whether a session has been initialized or not.
- `this.$v_session.has(key)`, checks whether the key exists in the Session
- `this.$v_session.remove(key)`, removes the given key from the Session
- `this.$v_session.clear()`, clear all keys in the Session, except for 'session-id', keeping the Session alive




## OPTIONS

`V_Session` has the following configuration options..

| Name | Type | Description |
| -------- | -------- | -------- |
| `unique`     | Boolean     | A Boolean value to determine whether the data stored in the session may persist between tabs and browser instances Defaults to `false`.     |
| `expire`     | Int     | An Int value to determine the lifetime of the session after closing the browser, the value is defined in minutes. Defaults to `(10)`.     |
| `inactive`     | Int     | An Int value to determine the lifetime of the session if the user is inactive, the value is defined in minutes. Defaults to `null`.     |
| `encrypt`     | Boolean     | An Int value to determine if the session information is encrypted. Defaults to `false`.     |
| `secret_key`     | String     | An Int value to determine the keyword for the encryption of session information.. Defaults to `null`.     |

Pass the options in the `use` method:

```javascript
var options = {
    unique: false,
    expire: 5,
    inactive: 3,
    encrypt:true,
    secret_key:'Hello World'
}

Vue.use(V_Session, options)
```


## Example

Your login method could look like this:

```javascript
export default {
    name: 'login',
    data: function(){
        return {
          email :'',
          password:''
      }
    },
    methods: {
        login: function () {
          this.$http.post('https://example/user/login', {
            password: this.password,
            email: this.email
          }).then(function (response) {
            if (response.status === 200 && 'token' in response.body) {
              this.$v_session.set('jwt', response.body.token)
              this.$v_session.set('username', response.body.username)
              Vue.http.headers.common['Authorization'] = 'Soport ' + response.body.token
              this.$router.push('/dashboard/')
            }
          }, function (err) {
            console.log('err', err)
          })
        }
    }
}
```

In your logged-in area, you can check whether or not a session is started and destroy it when the user wants to logout:

```javascript
export default {
  name: 'dashboard',
  data () {
    return { 
        username : null
    }
  },
  beforeCreate: function () {
    if (!this.$v_session.exists()) {
      this.$router.push('/')
    }
  },
  mounted() {
      this.username = this.$v_session.get('username')
  },
  methods: {
    logout: function () {
      this.$v_session.clear()
      this.$router.push('/')
    }
  }
}
```
