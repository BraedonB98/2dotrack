import React, {useEffect , useState, useContext} from 'react';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Modal from '../../shared/components/UIElements/Modal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import UserSearchList from './UserSearchList'
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './styling/UserSearchModal.css';

const ToDoItemModal = props => {
    const auth = useContext(AuthContext);
    const uid = auth.UID;
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [selectedUser , setSelectedUser]= useState();
    const [searchedUsers, setSearchedUsers]= useState();
    const [searchText, setSearchText]= useState("");
    
    const userInputHandler = event =>{
        setSearchText(event.target.value);   
    }

    const userSearchHandler = event =>{
        if (event.key === 'Enter' && searchText.length >= 2) {
           searchUser(event.target.value)
        }
    }
    const searchUser = async search =>{
        try{
            if(search.length >= 2){
            const responseData = await sendRequest(`http://localhost:5000/api/uid/userssearch/${search}`);
            setSearchText("");
            setSearchedUsers(responseData.users)
            }
        }
       catch(error){
           console.log(error)
       }
    }


return(<React.Fragment>
    <ErrorModal error = {error} onClear={clearError}/>
    {isLoading&&
            <div className = "center">
                <LoadingSpinner/>    
            </div>}
    
    {!isLoading  &&  <Modal
      onCancel={() =>{props.onClear();}} 
      header={`User Search`} 
      className = 'user-search-modal'
      headerClass = 'user-search-modal__header'
      contentClass = 'user-search-modal__content'
      footerClass = 'user-search-modal__footer'
      footer={<React.Fragment>
          <Button onClick={props.onClear}>Cancel</Button>
          <Button type="submit" onClick = {props.onSubmit} disabled={!selectedUser}> Submit </Button> </React.Fragment>}
       show ={true}
    >
    <div className='user-search-modal__search'>
        <input className= 'user-search-modal__user-search_input' id="name" element="input" type ="text" label="Search User"  autoComplete="off" onChange = {userInputHandler} onKeyDown={userSearchHandler} />
        <Button  onClick = {event=>{searchUser(searchText)}} disabled={searchText.length<2}> Search </Button> 
    </div>
    {(searchText.length<2 && searchText.length>0) && <p>please enter more of their name or email before searching</p>}
    {searchedUsers && <UserSearchList onSelectedUser = {props.onSelectedUser} users = {searchedUsers} />}
    </Modal>}
</React.Fragment>)
};

export default ToDoItemModal;