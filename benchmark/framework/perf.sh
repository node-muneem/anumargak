echo "Running restana with find-my-way"
node restana-with-find-my-way.js & sleep 5;
ab -k -n 50000 -c 100 -t 20 http://127.0.0.1:3000/this/is/static | grep "Requests per second:"
pkill -f restana-with-find-my-way.js;
sleep 3
#28k

echo "Running restana with anumargak"
node restana-with-anumargak.js & sleep 5;
ab -k -n 50000 -c 100 -t 20 http://127.0.0.1:3001/this/is/static | grep "Requests per second:"
pkill -f restana-with-anumargak.js;
sleep 3
#27k


echo "Running muneem"
node muneem.js & sleep 5;
ab -k -n 50000 -c 100 -t 20 http://127.0.0.1:3002/this/is/static | grep "Requests per second:"
pkill -f muneem.js;
sleep 3
#27k

