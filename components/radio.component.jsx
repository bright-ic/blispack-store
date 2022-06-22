import React, {useState, useCallback} from "react";
import {Label} from "admin-bro"

const select_style = {
    width:'100%',
    maxWidth: '250px',
    padding: '6px 20px',
    border: '1px solid #C0C0CA'
}
const CustomRadio = (props) => {
    const { property, onChange, record } = props;
    const original_val = record.params.can_purchase;

    const handleSelectChange = useCallback((evt) => {
        if(evt.target && evt.target.value) {
            onChange(property.name, evt.target.value)
        }
      },[])

    return (<>
        <Label>Can user purchase product?</Label>
        <select 
            style={{...select_style}} 
            name="can_purchase" 
            id="can_purchase" 
            defaultValue={original_val}
            onChange={handleSelectChange}
        >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
        </select>
    </>)
}

export default CustomRadio;