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
- Performant & Efficient
  - The Basket -> Bag -> Task System allows for tasks to be run efficiently and fast
  - The Trashman marks a later removal time to free up tasks with removal calls
    - Also marks an item in the Basket to be deleted so that it cannot be used while waiting to be removed
- Safe
  - BasketDB includes an easy way to Backup and Restore a database
  - Dumps the InternalBag.oldRepel (old database before error) onto a file for later restore for when something goes wrong
  - Also dumps the Logger trace into a filepath for easy debugging
- Easy to Debug Errors
  - Includes a strong Logger to debug, warn, and show errors
  - Logger also includes a trace to see everything that happened before a Dump
- Flexible & Schemas
  - With the use of typescript, the database(s) will always have a structure
- Small
  - BasketDB comes in at a very small package size
- Written in TypeScript
  - Builtin typedefs
  - Less common for bugs

## Download
