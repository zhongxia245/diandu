<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>

<body>

  <button id="submit">提交</button>
  <script src="../js/lib/zepto.js"></script>
  <script>
    $('#submit').on('click', function() {
      console.log('submit')
      var media = "kP2tWgUT_Bd7-gYLOhLX-toi4Pr4P9RMzXYtgReCawNDmdnh8ThfaBKKZjIFsVbJ";
      $.post('./weixindownload.php', {
        media_id: media
      }, function(data) {
        console.log(data)
      })
    })
  </script>
</body>

</html>