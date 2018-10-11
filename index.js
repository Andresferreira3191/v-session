
export default {
    install(vue, opts){   
        
        const v_session = {
            key                 :'v_session',
            session             : window.localStorage,
            expire_session      : 10,
            inactive_session    : null,
            pref                : 'v-id'
        }
        
        if(opts && 'unique' in opts && opts.unique) v_session.session = window.sessionStorage;
        else if(opts && 'unique' in opts && opts.unique == false) v_session.session = window.localStorage;
        
        // Fun will happen here
        vue.prototype.$v_session = {            
            init: function(){
                let v_this = vue.prototype.$v_session;                
                window.onload = v_this.live;
                document.onmousemove = v_this.refresh;
                document.onkeypress = v_this.refresh;
                var source = "Hello!";                        
            },
            live: function(){
                let v_this = vue.prototype.$v_session;
                var t;
                var off = v_session.inactive_session * 60 * 1000; 
                clearTimeout(t);
                if(v_session.inactive_session!==null) t = setTimeout(v_this.clear, off)                
                else t = setInterval(v_this.refresh, 1000)
            },
            start: function(){
                var session_data = this.gets();
                session_data['session-id'] = v_session.pref + ':' + Date.now();
                this.sets(session_data);
            },
            refresh: function(){
                let v_this = vue.prototype.$v_session;
                var session_data   = v_this.gets();
                v_this.sets(session_data);
            },
            gets: function(){                
                var session_data   = JSON.parse(v_session.session.getItem(v_session.key));
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
                var session_id      = v_session.pref + ':' + Date.now();
                var session_data    = { 'session-id': session_id };
                this.sets(session_data);
            },
            sets: function(session_data){
                var expire = new Date().getTime() + v_session.expire_session * 60 * 1000;
                if(Object.keys(session_data).length > 0) session_data['expire'] = expire
                v_session.session.setItem(v_session.key,JSON.stringify(session_data));
            },
            set: function(key,value){
                if(key == 'session-id') return false;
                var session_data = this.gets();    
                if(!('session-id' in session_data)){
                    this.start();
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
                var session_data = JSON.parse(v_session.session.getItem(v_session.key));
                session_data     = { 'session-id': session_data['session-id'], 'expire': session_data['expire'] };
                this.sets(session_data);
                return session_data
            }
            
        }
        vue.prototype.$v_session.init();
    }
}