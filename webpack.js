const path = require('path');

module.exports = {
    mode: "production",
    entry: ['./src/js/main.js', 
            './src/js/pdf.js'],
    output: {
      filename: '../js/bundle.js'
    },
    module: {
        rules: [
            {
              test: /\.less$/,
              use: [
                {
                  loader: 'style-loader',
                },
                {
                  loader: 'css-loader',
                },
                {
                  loader: 'less-loader',
                },
              ],
            },
            {
                test: /\.(css|scss)$/i,
                use: [
                    {
                      loader: 'style-loader',
                    },
                    {
                      loader: 'css-loader',
                    },
                    {
                      loader: 'postcss-loader',
                    },
                    {
                      loader: 'sass-loader',
                    },
                ],
              },
              {
                test: /\.(ttf|eot|svg|gif|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{
                    loader: 'file-loader'
                }]
              },
          ],
      },
  };