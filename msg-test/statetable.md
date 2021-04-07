The state table for extension behavior:

|  State     |    Event     |    New state  |
|------------|--------------|---------------|
| (. . .)    |action.onClick| started       |
| started    | tab_done     | hastab        |
| started    | content_done | hascontent    |
| hascontent | tab_done     | ready         |
| hastab     | content_done | ready         |
| ready      | do_output    | (done)        |
