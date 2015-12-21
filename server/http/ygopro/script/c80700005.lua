--明と宵の逆転
function c80700005.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetOperation(c80700005.efop)
	c:RegisterEffect(e1)
	--add
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetTarget(c80700005.eftg)
	e2:SetOperation(c80700005.efop)
	c:RegisterEffect(e2)
end
function c80700005.hfilter(c,tp,att)
	if att==ATTRIBUTE_LIGHT then
		return c:IsAttribute(att) and c:IsRace(RACE_WARRIOR) and Duel.IsExistingTarget(c80700005.dfilter,tp,LOCATION_DECK,0,1,nil,ATTRIBUTE_DARK,c:GetLevel())
	else
		return c:IsAttribute(att) and c:IsRace(RACE_WARRIOR) and Duel.IsExistingTarget(c80700005.dfilter,tp,LOCATION_DECK,0,1,nil,ATTRIBUTE_LIGHT,c:GetLevel())
	end
end
function c80700005.dfilter(c,att,lv)
	return c:IsAttribute(att) and c:IsRace(RACE_WARRIOR) and c:GetLevel()==lv
end
function c80700005.eftg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local b1=Duel.IsExistingTarget(c80700005.hfilter,tp,LOCATION_HAND,0,1,nil,tp,ATTRIBUTE_LIGHT)
	local b2=Duel.IsExistingTarget(c80700005.hfilter,tp,LOCATION_HAND,0,1,nil,tp,ATTRIBUTE_DARK)
	if chk==0 then return (b1 or b2) and Duel.GetFlagEffect(tp,80700005)==0 end
	Duel.RegisterFlagEffect(tp,80700005,RESET_PHASE+PHASE_END,0,1)
	e:SetLabel(1)
end
function c80700005.efop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetLabel()==0 then
		if not Duel.GetFlagEffect(tp,80700005)==0 then return end
		if Duel.SelectYesNo(tp,aux.Stringid(80700005,0))  then Duel.RegisterFlagEffect(tp,80700005,RESET_PHASE+PHASE_END,0,1) else return end
	end
	local op=0
	local b1=Duel.IsExistingTarget(c80700005.hfilter,tp,LOCATION_HAND,0,1,nil,tp,ATTRIBUTE_LIGHT)
	local b2=Duel.IsExistingTarget(c80700005.hfilter,tp,LOCATION_HAND,0,1,nil,tp,ATTRIBUTE_DARK)
		
	if b1 and b2 then
		op=Duel.SelectOption(tp,aux.Stringid(80700005,1),aux.Stringid(80700005,2))+1
	else if b1 then op=1 else op=2 end end
	if op==1 then
		local g=Duel.SelectMatchingCard(tp,c80700005.hfilter,tp,LOCATION_HAND,0,1,1,nil,tp,ATTRIBUTE_LIGHT)
		local tc=g:GetFirst()
		if tc then
			Duel.SendtoGrave(g:GetFirst(),nil,REASON_EFFECT)
			local h=Duel.SelectMatchingCard(tp,c80700005.dfilter,tp,LOCATION_DECK,0,1,1,nil,ATTRIBUTE_DARK,tc:GetLevel())
			local hc=h:GetFirst()
			if hc then Duel.SendtoHand(hc,nil,REASON_EFFECT) end
		end
	else
		local g=Duel.SelectMatchingCard(tp,c80700005.hfilter,tp,LOCATION_HAND,0,1,1,nil,tp,ATTRIBUTE_DARK)
		local tc=g:GetFirst()
		if tc then
			Duel.SendtoGrave(g:GetFirst(),nil,REASON_EFFECT)
			local h=Duel.SelectMatchingCard(tp,c80700005.dfilter,tp,LOCATION_DECK,0,1,1,nil,ATTRIBUTE_LIGHT,tc:GetLevel())
			local hc=h:GetFirst()
			if hc then Duel.SendtoHand(hc,nil,REASON_EFFECT) end
		end
		
	end
end