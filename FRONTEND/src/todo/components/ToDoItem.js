import React,{ useState, useEffect , useContext }from "react";
import {AiOutlineCheck,AiOutlineFieldTime,AiOutlineUnorderedList} from "react-icons/ai"
import {IoIosShareAlt} from "react-icons/io";
//-----------------------Components--------------------------
import Button from "../../shared/components/FormElements/Button";
import Card from '../../shared/components/UIElements/Card'
import Modal from "../../shared/components/UIElements/Modal";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Map from '../../shared/components/UIElements/Map';
import UserSearchModal from '../../users/components/UserSearchModal';

//----------------------Context--------------------------------


//----------------------Hooks---------------------------------
import { useHttpClient } from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";

//---------------------CSS-----------------------------------
import "./styling/ToDoItem.css"

const ToDoItem = props => {
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [expand, setExpand] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
   const [creatorInfo, setCreatorInfo]= useState();
   const auth= useContext(AuthContext);
   const UID = auth.UID;


    const openMapHandler = () => {
        setShowMap(true);
    }
    const closeMapHandler = () => {
        setShowMap(false);
    }
    const showDeleteWarningHandler = () =>{
        setShowConfirmModal(true);
    }

    const cancelDeleteHandler = () =>{
        setShowConfirmModal(false);
    }
    const confirmDeleteHandler = async () =>{
        if(!props.pending)
        {
            try{
            
                await sendRequest(`http://localhost:5000/api/todo/deleteitem/`,'DELETE',
               JSON.stringify({
                 tid : props._id}),
                 {'Content-Type': 'application/json'});
               props.onDeleteTask(props._id);
          }
           catch(error){}
           setShowConfirmModal(false)
        }
        else{
            //remove item from pending task list
            try{
                await sendRequest(`http://localhost:5000/api/todo/dismissPendingSharedItem/`,'PATCH',
               JSON.stringify({
                tid : props._id,
                uid: UID}),
                 {'Content-Type': 'application/json'});
                 props.onDismissTask(props._id);
               
          }
           catch(error){console.log(error)
           }
           setShowConfirmModal(false)
        }
        
    };
    const editTaskHandler = () =>{
        props.onEditTask(props._id);
    }

    const toggleExpand=()=>{
        if(expand )
        {
            setExpand(false);
        }
        else {
            setExpand(true);
        }
       
    }
    const startTask = async() => {

        try{
            
            await sendRequest(`http://localhost:5000/api/todo/edititem/${props._id}`,'PATCH',
           JSON.stringify({
             status : "Started"}),
             {'Content-Type': 'application/json'});

             props.onStatusChange(props._id,"Started")
           
      }
       catch(error){
           console.log("unable to change task status")
       }
       
    }
    const finishTask = async() => {
        try{
            
            await sendRequest(`http://localhost:5000/api/todo/edititem/${props._id}`,'PATCH',
           JSON.stringify({
             status : "Complete"}),
             {'Content-Type': 'application/json'});
            props.onStatusChange(props._id,"Complete")
      }
       catch(error){
           console.log("unable to change task status")
       }
    }
    const shareTask = async event =>{
        const user = JSON.parse(event.target.value)
        try{
            await sendRequest(`http://localhost:5000/api/todo/shareItem`,'PATCH',
                JSON.stringify({
                    tid : props._id,
                    uid: user._id
                 }),
                {'Content-Type': 'application/json'});

            setShowShareModal(false);
        }
       catch(error){}
      
    }
    const showShareTask = async event =>{
        event.stopPropagation();
        setShowShareModal(true);
    }
    const clearShareTask = () =>{
        setShowShareModal(false);
    }
    useEffect( ()=>{
        const getCreator = async() =>{
            
            const responseData = await sendRequest(`http://localhost:5000/api/uid/user/${props.creator}`)
            setCreatorInfo(responseData.user);
            
        }
        if(props.pending)
        {getCreator();}
    },[sendRequest,props.pending,props.creator])

return(
    <React.Fragment>
            <ErrorModal error= {error} onClear = {clearError} />
            <Modal 
                show = {showMap} 
                onCancel ={closeMapHandler} 
                header = {props.address} 
                contentClass="todo-item__modal-content"
                footerClass="todo-item__modal-actions"
                footer={<Button onClick= {closeMapHandler}>CLOSE</Button>}    
            >
                <div className="map-container">
                    <Map center ={props.location} zoom ={16}/>
                </div>
            </Modal>
            <Modal 
                show = {showConfirmModal}
                onCancel = {cancelDeleteHandler}
                header = "Are you sure?"
                footerClass = "todo-item__modal-actions" 
                footer = {
                    <React.Fragment>
                        <Button inverse onClick={cancelDeleteHandler}>CANCEL</Button>
                        <Button danger onClick={confirmDeleteHandler}>{props.pending?"DISMISS":"DELETE"}</Button>
                    </React.Fragment>
                } >
                    <p>Are you sure you want to {props.pending?"dismiss":"delete"} this task?</p>
            </Modal>
            {showShareModal && <UserSearchModal onClear = {clearShareTask} onSubmit = {shareTask}/>}
        <li className="todo-item " key = {props._id} >
        <Card  className="todo-item__content">
        {isLoading && <LoadingSpinner asOverlay />}
        <div onClick = {toggleExpand}  className="todo-item__header">
            {(props.status === "Complete" && !props.pending ) && <AiOutlineCheck className={`todo-item__icon-${props.priority}`}/>}
            {(props.status === "Started"&& !props.pending ) && <AiOutlineFieldTime className={`todo-item__icon-${props.priority}`}/>}
            {(props.status === "Pending"&& !props.pending ) && <AiOutlineUnorderedList className={`todo-item__icon-${props.priority}`}/>}
            <h2  >{props.name}</h2>
            {(creatorInfo && props.pending)&&<img className="to-do-item__creator-image" src={`http://localhost:5000/${creatorInfo.imageUrl}`} alt = {`${creatorInfo.name}`}/>}
            {(creatorInfo && props.pending)&&<h2 className="to-do-item__creator-name">{creatorInfo.name}</h2>}
            {!props.pending && <Button className = "todo-item__share" onClick={showShareTask}><IoIosShareAlt/></Button>}
        </div>
        
        
        {expand && (<div className="todo-item__expand">
            <p className = "todo-item__notes" >{props.notes}</p>
            {(props.status ==="Pending" && !props.pending) && (<Button onClick={startTask}>Start Task</Button>)}
            {(props.status ==="Started" && !props.pending)&& (<Button onClick={finishTask}>Finish Task</Button>)}

            {props.location && <Button onClick={openMapHandler}>VIEW ON MAP</Button>}
            {!props.pending && <Button onClick={editTaskHandler}>EDIT</Button>}
            <Button danger onClick = {showDeleteWarningHandler}>{props.pending?"DISMISS":"DELETE"}</Button>
            </div>)}
        </Card>
    </li>
    </React.Fragment> 
)}

export default ToDoItem;