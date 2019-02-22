
export default {
    install(vue, opts){   
        
        const v_session = {
            key                 :'v_session',
            session             : window.localStorage,
            expire_session      : 10,
            inactive_session    : null,
            pref                : 'v-id',
            encrypt             : false,
            secret_key          : null,
            algorithm           : 'aes256',
            encoding            : 'hex'
        }
        const cryptoJSON   = require("crypto-json");

        if(opts && 'unique' in opts && opts.unique) v_session.session = window.sessionStorage;
        else if(opts && 'unique' in opts && opts.unique == false) v_session.session = window.localStorage;
        
        if(opts && 'expire' in opts && opts.expire) v_session.expire_session = opts.expire;
        if(opts && 'inactive' in opts && opts.inactive) v_session.inactive_session = opts.inactive;
        if(opts && 'encrypt' in opts && opts.encrypt) v_session.encrypt = opts.encrypt;
        if(opts && 'secret_key' in opts && opts.secret_key) v_session.secret_key = opts.secret_key;
        
        // Fun will happen here
        vue.prototype.$v_session = {            
            init: function(){
                let v_this = vue.prototype.$v_session;  
                      
                window.onload = v_this.live;
                document.onmousemove = v_this.refresh;
                document.onkeypress = v_this.refresh;
                
                if(v_session.secret_key==null) console.log('Require Option "secret_key" ');
                v_this.setInit();                
            },
            live: function(){
                let v_this = vue.prototype.$v_session;
                var t;
                var off = v_session.inactive_session * 60 * 1000; 
                clearTimeout(t);
                if(v_session.inactive_session!==null) t = setTimeout(v_this.destroy, off)                
                else t = setInterval(v_this.refresh, 1000)
            },
            refresh: function(){
                let v_this = vue.prototype.$v_session;
                var session_data   = v_this.gets();
                v_this.sets(session_data);
            },
            gets: function(){                
                var session_data   = JSON.parse(v_session.session.getItem(v_session.key));
                if(session_data==null){
                    this.setInit();
                    session_data   = JSON.parse(v_session.session.getItem(v_session.key));
                }
                if (v_session.encrypt && v_session.secret_key!==null){  
                  var encrypt = ('encrypt' in session_data)? session_data['encrypt'] : false;
                  
                  if(encrypt==true){ 
                    if(typeof(session_data['expire'])!='number'){
                      session_data   = this.decrypt(session_data);
                    }               
                    
                    session_data['encrypt'] = false;
                  }
                }
                var expire         = ( session_data!== null && 'expire' in session_data )? session_data['expire'] : null;
                    
                if(expire !== null && new Date().getTime() < expire) return session_data || {};
                else if(expire == null) this.setInit();
                else return this.destroy();

                return session_data;
            },
            encrypt: function(session_data){
                var keys        = Object.keys(session_data);
                var index = keys.indexOf('encrypt');
                if (index > -1) { keys.splice(index, 1); }
                var encoding    = v_session.encoding;
                var algorithm   = v_session.algorithm;
                session_data    = cryptoJSON.encrypt( session_data, v_session.secret_key, { encoding, keys, algorithm} ) 
                return session_data;
            },
            decrypt: function(session_data){
                var keys        = Object.keys(session_data);
                var index = keys.indexOf('encrypt');
                if (index > -1) { keys.splice(index, 1); }
                var encoding    = v_session.encoding;
                var algorithm   = v_session.algorithm;
                session_data    = cryptoJSON.decrypt( session_data, v_session.secret_key, { encoding, keys, algorithm} )
                session_data['encrypt'] = false;
                return session_data;
            },
            get: function(key){                
                var session_data = this.gets();
                return session_data[key];
            },
            setInit: function(){
              var session_data   = JSON.parse(v_session.session.getItem(v_session.key));
              if(session_data==null){
                var session_id      = v_session.pref + ':' + Date.now();
                var session_data    = { 'session-id': session_id };
                this.sets(session_data);
              }              
            },
            sets: function(session_data){            
                
                var expire = new Date().getTime() + v_session.expire_session * 60 * 1000;
                if(Object.keys(session_data).length > 0) session_data['expire'] = expire
                var encrypt;
                if (v_session.encrypt && v_session.secret_key!==null){
                  encrypt = ('encrypt' in session_data)? session_data['encrypt'] : false;
                  
                  if (encrypt == false){
                    // Encrypt
                    session_data['encrypt'] = true;
                    session_data = this.encrypt(session_data);
                      
                  }
                }
                v_session.session.setItem(v_session.key,JSON.stringify(session_data));
            },
            set: function(key,value){
                
                if(key == 'session-id') return false;
                var session_data = this.gets();
                
                if(!('session-id' in session_data)){
                    this.setInit();
                    session_data = this.gets();
                }                
                session_data[key] = value;    
                this.sets(session_data);
            },
            exists: function(){
                var session_data = this.gets();
                return 'session-id' in session_data;
            },
            has: function(key){
                var session_data = this.gets();
                return key in session_data;
            },
            remove: function(key){
                var session_data = this.gets();
                delete session_data[key];    
                this.sets(session_data);
            },
            clear: function(){
                let v_this = vue.prototype.$v_session;
                var session_data = v_this.gets();
                if (v_session.encrypt && v_session.secret_key!==null){
                    session_data     = { 'session-id': session_data['session-id'], 'expire': session_data['expire'], 'encrypt': session_data['encrypt'] };
                }else{
                    session_data     = { 'session-id': session_data['session-id'], 'expire': session_data['expire']};
                }
                v_this.sets(session_data);
                return session_data
            },
            destroy: function(){
                let v_this = vue.prototype.$v_session;
                if (v_session.encrypt && v_session.secret_key!==null){
                    var session_data = {'encrypt': false };
                }else{
                    var session_data = {};
                }
                v_this.sets(session_data);
                return session_data
            }
        }
        vue.prototype.$v_session.init();
    }
}