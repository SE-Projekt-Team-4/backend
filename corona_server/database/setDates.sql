-- SQLite
Update match set Date_Time = "2020-02-12T19:15:00.000Z"
where id = 1;

Update match set Date_Time = "2020-05-12T19:30:00.000Z"
where id = 2;

Update match set Date_Time = "2020-12-16T13:00:00.000Z"
where id = 3;

Update match set Date_Time = "2020-12-30T15:45:00.000Z"
where id = 4;

Update match set Date_Time = "2021-02-12T12:15:00.000Z"
where id = 5;

Update Booking set MATCH_ID = 1, IS_REDEEMED = false
where id = 1;

Update Booking set MATCH_ID = 1, IS_REDEEMED = false
where id = 2;

Delete from Booking WHERE ID = 4 ;