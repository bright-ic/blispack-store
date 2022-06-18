import React from 'react'
import { Box, Label } from 'admin-bro';

const imgStyle = {
    width: "6em",
    border: "2px solid gray",
    borderRadius: "11px",
    margin: "1em auto",
  };

const List = (props) => {
  const { record } = props

  const srcImg = record.params['imagePath']
  return (
    <Box>
      {srcImg ? (
        <div>
        <Label>Product Image</Label>
        <img style={imgStyle} src={srcImg} alt="Product Image" />
      </div>
      ) : 'no image'}
    </Box>
  )
}

export default List