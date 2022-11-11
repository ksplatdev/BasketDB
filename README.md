# BasketDB

Fast, Scalable, Extremely-Small, Open-Source, NodeJS Database for all use-cases.

## Features

- Basket -> Bag -> Task System
  - Baskets (Databases) can be "splintered" into multiple Bags to handle tasks
    - This allows for easy scaling
  - Tasks are smartly assigned to Bags (Nodes) to handle a task (ie: search, add, remove, etc...)
- Fast Serialization & Deserialization
  - Uses Chrome V8 Serialization & Deserialization to store information
- Auto Read & Write
  - Read and Write calls must be called automatically
- Flexible & Schemas
  - With the use of typescript, the database(s) will always have a structure
- Performant & Efficient
  - The Basket -> Bag -> Task System allows for extremely fast tasks to be run
  - The Trashman marks a later removal time to free up tasks with removal calls
    - Also marks an item in the Basket to be deleted so that it cannot be used while waiting to be removed
- Safe
  - BasketDB includes an easy way to Backup and Restore a database
  - Dumps a Bag into a file (can have a specified location) for later restore for when something goes wrong
  - Also dumps the Logger trace into a filepath for when something goes wrong
- Easy to Debug Errors
  - Includes a strong Logger to debug, warn, and show errors
  - Logger also includes a trace to see everything that happened before a Dump
- Small
  - BasketDB comes in at a very small package size
- Written in TypeScript
  - Builtin typedefs
  - Less common for bugs

## Download
