import React, {useState, useEffect, useContext } from "react";

import { useHttpClient } from "../../shared/hooks/http-hook";
import SwipeableHook from "../../shared/hooks/gesture-hook"

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ToDoItemModal from "../components/ToDoItemModal";
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import {AuthContext} from "../../shared/context/auth-context";
import NewCategory from "../components/NewCategory";
import CategoryEditor from "../components/CategoryEditor";


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
    const [newCategory, setNewCategory] = useState(false);
    const [categoryEditor, setCategoryEditor] = useState(false);
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
        fetchCategories();
    },[sendRequest,UID])

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
        
        if(loadedCategory._id!==newCategory._id)
        {setLoadedCategory(newCategory)}
        
    }
    const toggleRight = () =>{
        const currentCatIndex = loadedCategories.findIndex(cat => cat.name===loadedCategory.name);
        if(loadedCategories[currentCatIndex+1]){
            setLoadedCategory(loadedCategories[currentCatIndex+1])
        }
    }
    const toggleLeft = () =>{
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
        //!console.log(newTask);
        const tempLoadedTasks= loadedTasks
        tempLoadedTasks.push( newTask)
        //!console.log(tempLoadedTasks);
        setLoadedTasks(tempLoadedTasks);
    }
    
    const handleCategoryEditor = () =>{
        categoryEditor?setCategoryEditor(false):setCategoryEditor(true);
        newCategory&& setNewCategory(false);
    }
    const handleNewCategory = () => {
        newCategory?setNewCategory(false):setNewCategory(true);
        CategoryEditor&& setCategoryEditor(false);
    }
    const renameCategoryHandler = newCategory => {
        setLoadedCategories(loadedCategories.map(category => {
            if(category._id === newCategory._id)
            {
                return(newCategory);
            }
            else{
                return(category);
            }
        }))

        setLoadedCategory (newCategory);//!--may have issue if promise isnt fulfilled yet
    }

return(
<React.Fragment>
    <ErrorModal error = {error} onClear={clearError}/>
    {(!isLoading && loadedCategory)&& <ToDoItemModal category = {loadedCategory} open={taskModal} taskId = {editTask}  submitted= {task=>{setTaskModal(false); (editTask?submitEditHandler(task):submitNewHandler(task));  setEditTask(false);}} onError = {handleTaskModalError} onClear={()=>{setTaskModal(false); setEditTask();}}  />}
    <SwipeableHook className ="todo-page__contents" onSwipedLeft = {toggleRight}  onSwipedRight = {toggleLeft}>{/*This is a div but swipeable events*/}
        {isLoading&&<div className = "center"><LoadingSpinner/></div>}
        {(!isLoading && loadedCategories) && <CategoryList onChangeCategory={changeLoadedCategoryHandler} categories= {loadedCategories}/> }
         {(!isLoading && loadedCategory) && 
            <div className="todo-page__header">
                <Button className = "todo-page__new-category-button"   onClick={handleNewCategory}>New Category</Button>
                <div className="todo-page__category-header">
                    <Button className = "todo-page__arrow-item-button"  onClick={toggleLeft}>&lt;</Button>
                    <Button className = "todo-page__current-category-header"  onClick={handleCategoryEditor}>{loadedCategory.name}</Button>
                    <Button className = "todo-page__arrow-item-button"  onClick={toggleRight}> &gt;</Button>
                </div>
                <Button className = "todo-page__new-to-do-item-button"  onClick={handleNewTask}>New Task</Button>
            </div> }
            {(!isLoading && newCategory ) && <NewCategory onCancel={()=>{setNewCategory(false)}}/> }
            {(!isLoading && categoryEditor && loadedCategory ) && <CategoryEditor onRename = {renameCategoryHandler}category = {loadedCategory}/>}
           
            

        <div className="todo-page__task-list">
            {(!isLoading && loadedTasks) && <ToDoList items={loadedTasks} onStatusChange = {taskStatusChangeHandler} onDeleteTask={taskDeletedHandler} onEditTask={handleEditTask} />}
        </div>
    </SwipeableHook>
</React.Fragment>
)}

export default ToDoPage;
