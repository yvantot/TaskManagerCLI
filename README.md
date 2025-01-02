<h1>Task Manager CLI</h1>
<p>Purpose: To learn Node.js, Regex and Git</p>
<p>Project duration: 10 hrs</p>
<br/>
<h2>Example Usage:</h2>
<pre>--> add "Stop procrastinating and learn Regex" # Add task to the json file</pre>
<pre>--> update (1) "Take a shower" # Overwrite a task by specifying the task's id</pre>
<pre>--> mark-|done|todo|doing| (1) # Overwrite the status</pre>
<pre>--> list |done|todo|doing| # Supports filter combination or without to list everything</pre>
<br/>
<h2>One-line Commands:</h2>
<pre>--> add "Sleep"; list; update (1) "Sleep for 15 minutes" -- Supports multiple commands in one-line</pre>
<br/>
<h2>Flexible Parser:</h2>
<pre>-->            add       "    Nah    " # Supported to support whatever reason you have</pre>
<pre>-->  delete   (    1    );    list    done   doing # Supported</pre>
