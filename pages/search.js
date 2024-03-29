import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useRouter } from 'next/router'
import { getRequest } from '../lib/script'
import dynamic from 'next/dynamic'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import Table from '../component/table'
import ReactContentLoader from '../component/loading_skeleton'
import MenuItem from '@material-ui/core/MenuItem'

// Import other components in the project
const SignOut = dynamic(() => import('../component/sign_out'), { ssr: false });
const ByPass = dynamic(() => import('../component/bypass'), { ssr: false });
const Filter = dynamic(() => import('../component/filter'), { ssr: false })

const Grid = dynamic(() => import('@material-ui/core/Grid'), { ssr: false });
const Container = dynamic(() => import('@material-ui/core/Container'), { ssr: false });
const Select = dynamic(() => import('@material-ui/core/Select'), { ssr: false });
const FormControl = dynamic(() => import('@material-ui/core/FormControl'), { ssr: false });

export default function Search() {
    // Cookies and router
    const cookies = new Cookies();
    const router = useRouter();

    //  Original result of the getRequest before any filter
    const [result, setResult] = useState([]);
    // Result displayed after filter ( this there is any)
    const [displayResult, setDisplayResult] = useState([]);
    // Text of search bar
    const [name, setName] = useState('');
    // The name searched by the user
    const [text, setText] = useState('');
    // Loading screen
    const [loading, setLoading] = useState(false);
    // The option used for the search
    const [searchOptions, setSearchOptions] = useState('name');
    // useEffect to check for currentID, if there is none push them back to home page
    useEffect(() => {
        if (!cookies.get('currentID')) {
            setTimeout(() => {
                router.push('/')
            }, 2000)
        }
    }, [])

    /** Handle Enter key pressed on search bar
     * 
     * @param {event} e - The key-press event 
     * @param {string} value - The component's name user entered
     */
    function handleKeyDown(e, value) {
        // If the key is "Enter"
        if (e.keyCode == 13) {
            if (value.length > 0) {
                // Reset the values in Filter
                setReset(true)
                // Start loading animation
                setLoading(true);
                // Find the component in the database
                getRequest(value, searchOptions, (result, status) => {
                    if (status === "success" && result) {
                        // end loading animation and show results
                        setLoading(false);
                        // Set the result state with the request's respond
                        setResult(result);
                        // Set the display result
                        setDisplayResult(result);
                        // Set the 
                        setText(value);
                    } else {
                        // end loading animation and show warnings
                        setLoading(false);
                        setResult([]);
                        setDisplayResult([]);
                        setText(value);
                    }
                });
            }

        }
    }

    /** Handle onClick event for the magnifier icon
     * 
     * @param {string} value - The component's name user entered
     */
    function handleOnClick(value) {
        // If it's not an empty string
        if (value.length > 0) {
            // Reset the values in the filter
            setReset(true);
            // start loading animation
            setLoading(true);
            // Find the component in the database
            getRequest(value, searchOptions, (result, status) => {
                if (status === "success" && result) {
                    // end loading animation and show results
                    setLoading(false);
                    setResult(result);
                    setDisplayResult(result);
                    setText(value);
                } else {
                    // end loading animation and show warnings
                    setLoading(false);
                    setResult([]);
                    setDisplayResult([]);
                    setText(value);
                }
            });
        }
    }

    // Function to handle when a search's option is clicked
    function handleSelect(e) {
        setSearchOptions(e.target.value)
    }

    // Function to pass to child
    const handleFilterorSomething = (filteredResult) => {
        setDisplayResult(filteredResult);
    }

    // Reset state to reset filter 
    const [reset, setReset] = useState(false);

    // Function to handle reset state
    const handleReset = (resetResult) => {
        setReset(resetResult);
    }

    // Render a page with a user is logged in
    if (cookies.get('currentID')) {
        return (
            <div>
                <SignOut />
                <Container maxWidth="sm" style={{ marginBottom: "10px" }}>
                    <Grid container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center" alignContent="center">

                        <div id="big_img">
                            <img alt="QUT Motorsport" height="92" id="hplogo" src="/img/logo_orange.png"
                                style={{ paddingTop: '10%', paddingBottom: "10px" }}
                                width="272" />
                        </div>

                        <Grid container alignItems="center"
                            justify="center" alignContent="center" style={{ marginLeft: "2em" }} >
                            <FormControl >
                                <Select
                                    style={{ color: "white", marginRight: "2px" }}
                                    value={searchOptions}
                                    onChange={handleSelect}
                                >
                                    <MenuItem value={"name"}>Name</MenuItem>
                                    <MenuItem value={"part_id"}>Part #</MenuItem>
                                    <MenuItem value={"retail_id"}>Retail</MenuItem>
                                </Select>
                            </FormControl>

                            <InputBase placeholder="Search component" autoComplete="off"
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, name)}
                                id="search-field"
                            />
                            <IconButton onClick={() => handleOnClick(name)} arial-label="search"
                                style={{ color: "white" }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Grid>
                    </Grid>

                </Container>

                <Filter data={displayResult} ogData={result} onClickFilter={handleFilterorSomething} reset={reset} handleReset={handleReset} />
                {loading ? <ReactContentLoader /> : <Table data={displayResult} mobile={true} search={text} />}
            </div>

        )
    } else {
        return (
            <div>
                <ByPass message="Log in Please." />
            </div>
        )
    }
}