--ギアギアチェンジ
function c29067939.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,29067939+EFFECT_COUNT_CODE_OATH)
	e1:SetTarget(c29067939.target)
	e1:SetOperation(c29067939.activate)
	c:RegisterEffect(e1)
end
function c29067939.filter(c,e,tp)
	return c:IsSetCard(0x1072) and c:IsCanBeEffectTarget(e) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c29067939.xyzfilter(c,mg,ct)
	return c:IsXyzSummonable(mg) and c.xyz_count<=ct
end
function c29067939.mfilter1(c,exg)
	return exg:IsExists(c29067939.mfilter2,1,nil,c)
end
function c29067939.mfilter2(c,mc)
	return c.xyz_filter(mc)
end
function c29067939.xyzct(c)
	return c.xyz_count
end
function c29067939.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	local mg=Duel.GetMatchingGroup(c29067939.filter,tp,LOCATION_GRAVE,0,nil,e,tp)
	local mct=mg:GetClassCount(Card.GetCode)
	local ct=Duel.GetLocationCount(tp,LOCATION_MZONE)
	if ct>mct then ct=mct end
	local exg=Duel.GetMatchingGroup(c29067939.xyzfilter,tp,LOCATION_EXTRA,0,nil,mg,ct)
	local maxg,maxc=exg:GetMaxGroup(c29067939.xyzct)
	if maxc and ct>maxc then ct=maxc end
	if chk==0 then return Duel.IsPlayerCanSpecialSummonCount(tp,2)
		and ct>1 and Duel.IsExistingMatchingCard(c29067939.xyzfilter,tp,LOCATION_EXTRA,0,1,nil,mg,ct) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local sg1=mg:FilterSelect(tp,c29067939.mfilter1,1,1,nil,exg)
	local tc1=sg1:GetFirst()
	local exg2=exg:Filter(c29067939.mfilter2,nil,tc1)
	mg:Remove(Card.IsCode,nil,tc1:GetCode())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local sg2=mg:FilterSelect(tp,c29067939.mfilter1,1,1,nil,exg2)
	sg1:Merge(sg2)
	mg:Remove(Card.IsCode,nil,sg2:GetFirst():GetCode())
	ct=ct-2
	local minc=2
	local exg3=Duel.GetMatchingGroup(c29067939.spfilter,tp,LOCATION_EXTRA,0,nil,sg1,minc)
	while mg:GetCount()>0 and ct>0 and (exg3:GetCount()==0 or Duel.SelectYesNo(tp,aux.Stringid(29067939,0))) do
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg3=mg:FilterSelect(tp,c29067939.mfilter1,1,1,nil,exg2)
		sg1:Merge(sg3)
		mg:Remove(Card.IsCode,nil,sg3:GetFirst():GetCode())
		ct=ct-1
		minc=minc+1
		exg3=Duel.GetMatchingGroup(c29067939.spfilter,tp,LOCATION_EXTRA,0,nil,sg1,minc)
	end
	Duel.SetTargetCard(sg1)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,sg1,sg1:GetCount(),0,0)
end
function c29067939.filter2(c,e,tp)
	return c:IsRelateToEffect(e) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c29067939.spfilter(c,mg,ct)
	return c:IsXyzSummonable(mg) and c.xyz_count==ct
end
function c29067939.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(c29067939.filter2,nil,e,tp)
	local ct=Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	local xyzg=Duel.GetMatchingGroup(c29067939.spfilter,tp,LOCATION_EXTRA,0,nil,g,ct)
	if ct>=2 and xyzg:GetCount()>0 then
		Duel.BreakEffect()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local xyz=xyzg:Select(tp,1,1,nil):GetFirst()
		Duel.XyzSummon(tp,xyz,g)
	end
end
