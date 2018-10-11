
export default {
    install(vue, opts){   
        
        const v_session = {
            key                 :'v_session',
            session             : window.localStorage,
            expire_session      : 10,
            inactive_session    : 20,
            pref                : 'v-id',
            encrypt             : true,
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
        
        // Fun will happen here
        vue.prototype.$v_session = {            
            init: function(){
                let v_this = vue.prototype.$v_session;  
                      
                window.onload = v_this.live;
                //document.onmousemove = v_this.refresh;
                //document.onkeypress = v_this.refresh;
                
                if(v_session.secret_key==null) v_session.secret_key = this.v_key(512);
                v_this.setInit();                
            },
            v_key:function(length)
            {
              
                var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
                var key = "";
                var i;
                for (i=0; i<length; i++) key += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
                return key;
            },
            live: function(){
                let v_this = vue.prototype.$v_session;
                var t;
                var off = v_session.inactive_session  * 1000; 
                clearTimeout(t);
                if(v_session.inactive_session!==null) t = setTimeout(v_this.clear, off)                
                //else t = setInterval(v_this.refresh, 1000)
            },
            start: function(){
                var session_data = this.gets();
                //session_data['session-id'] = v_session.pref + ':' + Date.now();
                //this.sets(session_data);
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
                  
                  if (v_session.encrypt){  
                            
                    var keys        = Object.keys(session_data);
                    var encoding    = v_session.encoding;
                    var algorithm   = v_session.algorithm;         
                    session_data    = cryptoJSON.decrypt( session_data, v_session.secret_key, { encoding, keys, algorithm} )
                  }
                var expire         = ( session_data!== null && 'expire' in session_data )? session_data['expire'] : null;
                    
                if(expire !== null && new Date().getTime() < expire) return session_data || {};
                else if(expire == null) this.setInit();
                else return this.clear();
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
                
                if (v_session.encrypt){
                   // Encrypt
                    var keys        = Object.keys(session_data);
                    var encoding    = v_session.encoding;
                    var algorithm   = v_session.algorithm;
                    session_data    = cryptoJSON.encrypt( session_data, v_session.secret_key, { encoding, keys, algorithm} )   
                    
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
                console.log(session_data);  
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
                var session_data = JSON.parse(v_session.session.getItem(v_session.key));
                session_data     = { 'session-id': session_data['session-id'], 'expire': session_data['expire'] };
                this.sets(session_data);
                return session_data
            }
            
        }
        vue.prototype.$v_session.init();
    }
}