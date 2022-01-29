import React, {useState, useEffect, useContext } from "react";

import { useHttpClient } from "../../shared/hooks/http-hook";
import SwipeableHook from "../../shared/hooks/gesture-hook"

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ToDoItemModal from "../components/ToDoItemModal";
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import {AuthContext} from "../../shared/context/auth-context";

import ToDoList from "../components/ToDoList";
import CategoryList from "../components/CategoriesList";

import "./styling/ToDoPage.css"

const ToDoPage = () => {
    const{isLoading,error,sendRequest,clearError} = useHttpClient();
    const [taskModal, setTaskModal] = useState(false);
    const [loadedTasks, setLoadedTasks] = useState();
    const [loadedCategory, setLoadedCategory] = useState();
    const[loadedCategories,setLoadedCategories]= useState();
    const[editTask,setEditTask]= useState(false);
    const auth= useContext(AuthContext);
    const UID = auth.UID;

    useEffect( ()=>{
        const fetchCategories = async ()=>{
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/todo/categories/${UID}`);
                setLoadedCategories(responseData.categories);
                setLoadedCategory(responseData.categories[0]);
              }
              catch(err){}
          };
        fetchCategories();// eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect( ()=>{
        const fetchTasks = async ()=>{
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/todo/getItems/${UID}/${loadedCategory.name}`);
                setLoadedTasks(responseData.items);
              }
              catch(err){}
      
          };
        fetchTasks();
    },[sendRequest, UID,loadedCategory])

    const taskDeletedHandler = (deletedTaskId) => {
        console.log("deleting")
        setLoadedTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTaskId));
    };

    const taskStatusChangeHandler = (tid,status) => {
        console.log("changing status")
        setLoadedTasks(loadedTasks.map( task =>
            {
                console.log(task._id)
                if(task._id === tid ){
                    task.status = status;
                }
                return (task);
            }
        ));
    }

    const changeLoadedCategoryHandler = async(newCategory) =>{
        if(loadedCategory.name!==newCategory.name)
        {setLoadedCategory(newCategory)}
        
    }
    const leftSwipe = () =>{
        const currentCatIndex = loadedCategories.findIndex(cat => cat.name===loadedCategory.name);
        if(loadedCategories[currentCatIndex+1]){
            setLoadedCategory(loadedCategories[currentCatIndex+1])
        }
    }
    const rightSwipe = () =>{
        const currentCatIndex = loadedCategories.findIndex(cat => cat.name===loadedCategory.name);
        if(loadedCategories[currentCatIndex-1]){
            setLoadedCategory(loadedCategories[currentCatIndex-1])
        }
    }
    const handleEditTask = editTaskId => {
        setEditTask(editTaskId);
        setTaskModal(true);
    }
    const handleNewTask = () => {
        setEditTask(false);
        setTaskModal(true);
    }
    const handleTaskModalError = error => {
        console.log(error)
    }
    const submitEditHandler = editedTask =>{
        setLoadedTasks(loadedTasks.map((task) => {
            if(task._id === editedTask._id)
            {
                console.log("found")
                return(editedTask);
            }
            else{
                return(task)
            }
        }))
    }
    const submitNewHandler = newTask =>{
        console.log(newTask);
        const tempLoadedTasks= loadedTasks
        tempLoadedTasks.push( newTask)
        console.log(tempLoadedTasks);
        setLoadedTasks(tempLoadedTasks);
    }



return(
    <React.Fragment>
            <ErrorModal error = {error} onClear={clearError}/>
            {(!isLoading && loadedCategory)&& <ToDoItemModal category = {loadedCategory} open={taskModal} taskId = {editTask} newItem = {!editTask} submitted= {task=>{setTaskModal(false); (editTask?submitEditHandler(task):submitNewHandler(task));  setEditTask(false);}} onError = {handleTaskModalError} onClear={()=>{setTaskModal(false); setEditTask();}}  />}
            <SwipeableHook onSwipedLeft = {leftSwipe}  onSwipedRight = {rightSwipe}>{/*This is a div but swipeable events*/}
            {isLoading&&
            <div className = "center">
                <LoadingSpinner/>    
            </div>}
            
                {(!isLoading && loadedCategories) && <CategoryList onChangeCategory={changeLoadedCategoryHandler} categories= {loadedCategories}/> }
            
            <div>
                {(!isLoading && loadedCategory) && 
                    <h1>{loadedCategory.name}
                        <Button className = "todo-page__new-to-do-item-button" category = {loadedCategory.name} onClick={handleNewTask}>+</Button>
                    </h1> }
                {(!isLoading && loadedTasks) && <ToDoList items={loadedTasks} onStatusChange = {taskStatusChangeHandler} onDeleteTask={taskDeletedHandler} onEditTask={handleEditTask} />}
            </div>
            </SwipeableHook>
        </React.Fragment>
    
)}

export default ToDoPage;
