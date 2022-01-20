import React,{ useState, useContext}from "react";

//-----------------------Components--------------------------
import Button from "../../shared/components/FormElements/Button";
import Card from '../../shared/components/UIElements/Card'
import Modal from "../../shared/components/UIElements/Modal";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Map from '../../shared/components/UIElements/Map';

//----------------------Context--------------------------------
import { AuthContext } from "../../shared/context/auth-context";

//----------------------Hooks---------------------------------
import { useHttpClient } from "../../shared/hooks/http-hook";

const ToDoItem = props => {
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const auth = useContext(AuthContext);
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
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
        //try{
        //    await sendRequest(`http://localhost:5000/api/places/${props.id}`,'DELETE');
       //     props.onDelete(props.id);
      // }
       // catch(error){}
       // console.log("You just got deleted!!!! BOOM");
        //setShowConfirmModal(false)
    };

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
                    <Map center ={props.coordinates} zoom ={16}/>
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
                        <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
                    </React.Fragment>
                } >
                    <p>Are you sure you want to delete this place?</p>
            </Modal>
        <li className="todo-item ">
        <Card className="todo-item__content">
        {isLoading && <LoadingSpinner asOverlay />}
        <div className="todo-item__info">
            <h2>{props.title}</h2>
            <p>{props.notes}</p>
        </div>
        <div className="todo-item__actions">
            <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
            {auth.isLoggedIn && (<Button to={`/places/${props.id}`}>EDIT</Button>)}
            {auth.isLoggedIn && (<Button danger onClick = {showDeleteWarningHandler}>DELETE</Button>)}
            
        </div>
        </Card>
    </li>
    </React.Fragment> 
)}

export default ToDoItem;