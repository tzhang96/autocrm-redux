"use strict";exports.id=128,exports.ids=[128],exports.modules={6318:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.CustomerAPI=void 0;let a=s(4245);class r{constructor(e,t){this.supabase=e,this.customerEmail=t}async listMyTickets(e){return(0,a.listTickets)(this.supabase,{...e,createdBy:this.customerEmail})}async getMyTicket(e){let t=await (0,a.getTicket)(this.supabase,e);return t&&t.customer_email===this.customerEmail?t:null}async createTicket(e){return(0,a.createTicket)(this.supabase,{...e,customerEmail:this.customerEmail,createdBy:this.customerEmail})}async replyToTicket(e,t){return await this.getMyTicket(e)?(0,a.createMessage)(this.supabase,{ticketId:e,userId:this.customerEmail,content:t,visibility:"public",messageType:"text",isAiGenerated:!1}):null}async getTicketMessages(e,t){return await this.getMyTicket(e)?(0,a.getTicketMessages)(this.supabase,e,{...t,visibility:"public"}):[]}}t.CustomerAPI=r},5640:(e,t,s)=>{t.BD=void 0;var a=s(6318);Object.defineProperty(t,"BD",{enumerable:!0,get:function(){return a.CustomerAPI}}),s(4073)},2022:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AdminAPI=void 0;let a=s(4245),r=s(7884);class i extends r.BaseStaffAPI{constructor(e,t,s){super(e,t,s)}async listAllTickets(e){return(0,a.listTickets)(this.supabase,e)}async assignTicketToAgent(e,t){return(0,a.assignTicket)(this.supabase,e,t)}async deleteTicket(e){return(0,a.deleteTicket)(this.supabase,e)}async listUsers(){return(0,a.listUsers)(this.supabase)}async updateUserRole(e,t){return(0,a.updateUserRole)(this.supabase,e,t)}}t.AdminAPI=i},6676:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AgentAPI=void 0;let a=s(4245),r=s(7884);class i extends r.BaseStaffAPI{constructor(e,t,s){super(e,t,s)}async listAssignedTickets(){return(0,a.listTickets)(this.supabase,{assignedTo:this.staffId})}async listUnassignedTickets(){return(0,a.listTickets)(this.supabase,{assignedTo:null})}async assignTicketToSelf(e){return(0,a.assignTicket)(this.supabase,e,this.staffId)}}t.AgentAPI=i},7884:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.BaseStaffAPI=void 0;let a=s(4245);class r{constructor(e,t,s){this.supabase=e,this.staffEmail=t,this.staffId=s}async getTicket(e){return(0,a.getTicket)(this.supabase,e)}async createTicketForCustomer(e,t){return(0,a.createTicket)(this.supabase,{...t,customerEmail:e,createdBy:this.staffId})}async updateTicketStatus(e,t){return(0,a.updateTicket)(this.supabase,e,{status:t})}async addMessage(e,t,s){return(0,a.createMessage)(this.supabase,{ticketId:e,userId:this.staffId,content:t,visibility:s,messageType:"text",isAiGenerated:!1})}async getTicketMessages(e){return(0,a.getTicketMessages)(this.supabase,e)}}t.BaseStaffAPI=r},4073:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AdminAPI=t.AgentAPI=t.BaseStaffAPI=void 0;var a=s(7884);Object.defineProperty(t,"BaseStaffAPI",{enumerable:!0,get:function(){return a.BaseStaffAPI}});var r=s(6676);Object.defineProperty(t,"AgentAPI",{enumerable:!0,get:function(){return r.AgentAPI}});var i=s(2022);Object.defineProperty(t,"AdminAPI",{enumerable:!0,get:function(){return i.AdminAPI}})},91:(e,t,s)=>{s.d(t,{S:()=>r});var a=s(6259);let r=()=>(0,a.UU)("https://efjszjdjipikfelsprrj.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanN6amRqaXBpa2ZlbHNwcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDY2MTksImV4cCI6MjA1MjgyMjYxOX0.5KOcDjOxjgN2QfGijgz3rssyYD5isWsK2NXo-jpp4D4")},1664:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.DatabaseError=void 0,t.wrapDbError=function(e,t){return new s(t instanceof s?t.message:`Failed to ${e}`,e,t)};class s extends Error{constructor(e,t,s){super(e),this.operation=t,this.originalError=s,this.name="DatabaseError"}}t.DatabaseError=s},1763:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.createMessage=i,t.getMessage=c,t.updateMessage=o,t.deleteMessage=n,t.getTicketMessages=l;let a=s(1664),r=s(8814);async function i(e,t){try{let{data:s,error:i}=await e.from("messages").insert({ticket_id:t.ticketId,user_id:t.userId,content:t.content,visibility:t.visibility||"public",message_type:t.messageType||"text",is_ai_generated:t.isAiGenerated||!1,metadata:t.metadata||{}}).select(r.MESSAGE_FIELDS.select).single();if(i)throw new a.DatabaseError("Failed to create message","createMessage",i);if(!s)throw new a.DatabaseError("Failed to create message","createMessage");return s}catch(e){throw(0,a.wrapDbError)("createMessage",e)}}async function c(e,t){try{let{data:s,error:i}=await e.from("messages").select(r.MESSAGE_FIELDS.select).eq("id",t).single();if(i)throw new a.DatabaseError("Failed to get message","getMessage",i);return s}catch(e){throw(0,a.wrapDbError)("getMessage",e)}}async function o(e,t,s){try{let{data:i,error:c}=await e.from("messages").update({...s.content&&{content:s.content},...s.metadata&&{metadata:s.metadata},edited_at:new Date().toISOString()}).eq("id",t).select(r.MESSAGE_FIELDS.select).single();if(c)throw new a.DatabaseError("Failed to update message","updateMessage",c);if(!i)throw new a.DatabaseError("Message not found","updateMessage");return i}catch(e){throw(0,a.wrapDbError)("updateMessage",e)}}async function n(e,t){try{let{error:s}=await e.from("messages").delete().eq("id",t);if(s)throw new a.DatabaseError("Failed to delete message","deleteMessage",s)}catch(e){throw(0,a.wrapDbError)("deleteMessage",e)}}async function l(e,t,s){try{let i=e.from("messages").select(r.MESSAGE_FIELDS.select).eq("ticket_id",t).order("created_at",{ascending:!0});s?.visibility&&(i=i.eq("visibility",s.visibility)),s?.type&&(i=i.eq("message_type",s.type)),i=(0,r.applyPagination)(i,s);let{data:c,error:o}=await i;if(o)throw new a.DatabaseError("Failed to get ticket messages","getTicketMessages",o);return c||[]}catch(e){throw(0,a.wrapDbError)("getTicketMessages",e)}}},8774:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.createTicket=i,t.getTicket=c,t.updateTicket=o,t.deleteTicket=n,t.listTickets=l,t.assignTicket=u;let a=s(1664),r=s(8814);async function i(e,t){try{let{count:s}=await e.from("tickets").select("*",{count:"exact",head:!0}).eq("customer_email",t.customerEmail).in("status",["open","pending"]).single();if(s&&s>=10)throw new a.DatabaseError("Maximum number of active tickets (10) reached","createTicket");let{data:r,error:i}=await e.from("tickets").insert({title:t.title,description:t.description,status:t.status||"open",priority:t.priority||"medium",tags:t.tags||[],customer_email:t.customerEmail,created_by:t.createdBy,custom_fields:t.customFields||{}}).select().single();if(i)throw new a.DatabaseError("Failed to create ticket","createTicket",i);if(!r)throw new a.DatabaseError("Failed to create ticket","createTicket");return r}catch(e){throw(0,a.wrapDbError)("createTicket",e)}}async function c(e,t){try{let{data:s,error:i}=await e.from("tickets").select(r.USER_FIELDS.select).eq("id",t).single();if(i)throw new a.DatabaseError("Failed to get ticket","getTicket",i);return s}catch(e){throw(0,a.wrapDbError)("getTicket",e)}}async function o(e,t,s){try{let{data:i,error:c}=await e.from("tickets").update({...s.title&&{title:s.title},...s.description&&{description:s.description},...s.status&&{status:s.status},...s.priority&&{priority:s.priority},...void 0!==s.assignedTo&&{assigned_to:s.assignedTo},...s.tags&&{tags:s.tags},...s.customFields&&{custom_fields:s.customFields}}).eq("id",t).select(r.USER_FIELDS.select).single();if(c)throw new a.DatabaseError("Failed to update ticket","updateTicket",c);if(!i)throw new a.DatabaseError("Ticket not found","updateTicket");return i}catch(e){throw(0,a.wrapDbError)("updateTicket",e)}}async function n(e,t){try{let{error:s}=await e.from("tickets").delete().eq("id",t);if(s)throw new a.DatabaseError("Failed to delete ticket","deleteTicket",s)}catch(e){throw(0,a.wrapDbError)("deleteTicket",e)}}async function l(e,t){try{let s=e.from("tickets").select(r.USER_FIELDS.select).order("created_at",{ascending:!1});t?.status&&(s=s.eq("status",t.status)),t?.priority&&(s=s.eq("priority",t.priority)),t?.assignedTo&&(s=s.eq("assigned_to",t.assignedTo)),t?.createdBy&&(s=s.eq("created_by",t.createdBy)),t?.search&&(s=s.or(`title.ilike.%${t.search}%,description.ilike.%${t.search}%,customer_email.ilike.%${t.search}%`)),t?.tags?.length&&(s=s.contains("tags",t.tags)),s=(0,r.applyPagination)(s,t);let{data:i,error:c}=await s;if(c)throw new a.DatabaseError("Failed to list tickets","listTickets",c);return i||[]}catch(e){throw(0,a.wrapDbError)("listTickets",e)}}async function u(e,t,s){try{let{data:i,error:c}=await e.from("tickets").update({assigned_to:s}).eq("id",t).select(r.USER_FIELDS.select).single();if(c)throw new a.DatabaseError("Failed to assign ticket","assignTicket",c);if(!i)throw new a.DatabaseError("Ticket not found","assignTicket");return i}catch(e){throw(0,a.wrapDbError)("assignTicket",e)}}},4695:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.getUser=i,t.getUserByEmail=c,t.updateUserRole=o,t.listUsers=n;let a=s(1664),r=s(8814);async function i(e,t){try{let{data:s,error:r}=await e.from("users").select("*").eq("id",t).single();if(r)throw new a.DatabaseError("Failed to get user","getUser",r);return s}catch(e){throw(0,a.wrapDbError)("getUser",e)}}async function c(e,t){try{let{data:s,error:r}=await e.from("users").select("*").eq("email",t).single();if(r)throw new a.DatabaseError("Failed to get user by email","getUserByEmail",r);return s}catch(e){throw(0,a.wrapDbError)("getUserByEmail",e)}}async function o(e,t,s){try{let{data:r,error:i}=await e.from("users").update({role:s}).eq("id",t).select().single();if(i)throw new a.DatabaseError("Failed to update user role","updateUserRole",i);if(!r)throw new a.DatabaseError("User not found","updateUserRole");return r}catch(e){throw(0,a.wrapDbError)("updateUserRole",e)}}async function n(e,t){try{let s=e.from("users").select("*").order("created_at",{ascending:!1});t?.role&&(s=s.eq("role",t.role)),t?.search&&(s=s.or(`email.ilike.%${t.search}%,name.ilike.%${t.search}%`)),s=(0,r.applyPagination)(s,t);let{data:i,error:c}=await s;if(c)throw new a.DatabaseError("Failed to list users","listUsers",c);return i||[]}catch(e){throw(0,a.wrapDbError)("listUsers",e)}}},8814:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.MESSAGE_FIELDS=t.USER_FIELDS=t.DEFAULT_PAGE_SIZE=void 0,t.applyPagination=function(e,s){return s?.limit&&(e=e.limit(s.limit)),s?.offset&&(e=e.range(s.offset,s.offset+(s.limit||t.DEFAULT_PAGE_SIZE)-1)),e},t.DEFAULT_PAGE_SIZE=10,t.USER_FIELDS={select:"*, created_by_user:users!tickets_created_by_fkey(id,email,name,role,created_at), assigned_to_user:users!tickets_assigned_to_fkey(id,email,name,role,created_at)"},t.MESSAGE_FIELDS={select:"*, user:users(id,email,name,role,created_at)"}},4245:(e,t,s)=>{var a=Object.create?function(e,t,s,a){void 0===a&&(a=s);var r=Object.getOwnPropertyDescriptor(t,s);(!r||("get"in r?!t.__esModule:r.writable||r.configurable))&&(r={enumerable:!0,get:function(){return t[s]}}),Object.defineProperty(e,a,r)}:function(e,t,s,a){void 0===a&&(a=s),e[a]=t[s]},r=function(e,t){for(var s in e)"default"===s||Object.prototype.hasOwnProperty.call(t,s)||a(t,e,s)};Object.defineProperty(t,"__esModule",{value:!0}),r(s(5127),t),r(s(8774),t),r(s(1763),t),r(s(4695),t),r(s(1664),t),r(s(8814),t)},5127:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0})}};