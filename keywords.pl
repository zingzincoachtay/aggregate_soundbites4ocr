#!/usr/bin/perl -w
use strict;
use warnings;

sub count_keywords {
  my $hr = $_[0];
  my @T = @_[1,-1];
  foreach my $t (@T){
    my @words = ($t=~/\w+/g);
    print join("\n",@words)."\n";
  }
}

my $found_keywords = {};
open(FH, '<', $ARGV[0]) or die $!;
while(my $line=<FH>){
  chomp $line;
  if($line =~ /^"(.+)","(.+)","(.+)"$/){
    $found_keywords = &count_keywords($found_keywords,$1,$2,$3);
  }
}
while(my ($key,$val) = each(%$found_keywords)){
  print "$key $val\n" if $val>10;
}

