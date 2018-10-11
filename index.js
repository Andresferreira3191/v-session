


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
                console.log('init')
                var source = "Hello!";
               
            },
            setInit: function(){
                var session_id      = v_session.pref + ':' + Date.now();
                var session_data    = { 'session-id': session_id };
                this.set(session_data);
            },
            gets: function(){
                var session_data   = JSON.parse(v_session.session.getItem(v_session.key));
                var expire         = ( session_data!== null && 'expire' in session_data )? session_data['expire'] : null;
                if(expire !== null && new Date().getTime() < expire) return session_data || {};
                else if(expire == null) this.setInit();
                else return this.clear();    
            },
            set: function(session_data){
                var expire = new Date().getTime() + v_session.expire_session * 60 * 1000;
                if(Object.keys(session_data).length > 0) session_data['expire'] = expire
                v_session.session.setItem(v_session.key,JSON.stringify(session_data));
            },
            clear: function(){
                var session_data = this.gets();
                session_data     = { 'session-id': session_data['session-id'], 'expire': session_data['expire'] };
                this.setAll(session_data);
                return session_data
            },
            start: function(){
                this.init();
                var session_data = this.gets();
                session_data['session-id'] = v_session.pref + ':' + Date.now();
                this.set(session_data);
            }
        }
    }
}