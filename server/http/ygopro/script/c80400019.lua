--サイバー・リペア・プラント
function c80400019.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH+CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80400019.condition)
	e1:SetCost(c80400019.cost)
	e1:SetTarget(c80400019.target)
	e1:SetOperation(c80400019.activate)
	c:RegisterEffect(e1)
end
function c80400019.cfilter(c)
	return c:IsSetCard(0x103c)
end
function c80400019.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80400019.cfilter,tp,LOCATION_GRAVE,0,1,nil)
end
function c80400019.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80400019)==0 end
	Duel.RegisterFlagEffect(tp,80400019,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80400019.dfilter(c)
	return c:IsRace(RACE_MACHINE) and c:IsAttribute(ATTRIBUTE_LIGHT) and c:IsAbleToHand()
end
function c80400019.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80400019.dfilter,tp,LOCATION_DECK,0,1,nil)
		or Duel.IsExistingTarget(c80400019.dfilter,tp,LOCATION_GRAVE,0,1,nil) end
	local sel=0
	local ac=0
	if Duel.IsExistingMatchingCard(c80400019.dfilter,tp,LOCATION_DECK,0,1,nil) then sel=sel+1 end
	if Duel.IsExistingTarget(c80400019.dfilter,tp,LOCATION_GRAVE,0,1,nil) then sel=sel+2 end
	if sel==1 then
		ac=Duel.SelectOption(tp,aux.Stringid(80400019,0))
	elseif sel==2 then
		ac=Duel.SelectOption(tp,aux.Stringid(80400019,1))+1
	elseif Duel.IsExistingMatchingCard(c80400019.cfilter,tp,LOCATION_GRAVE,0,3,nil) then
		ac=Duel.SelectOption(tp,aux.Stringid(80400019,0),aux.Stringid(80400019,1),aux.Stringid(80400019,2))
	else
		ac=Duel.SelectOption(tp,aux.Stringid(80400019,0),aux.Stringid(80400019,1))
	end
	e:SetLabel(ac)
end
function c80400019.activate(e,tp,eg,ep,ev,re,r,rp)
	local ac=e:GetLabel()
	if ac==0 or ac==2 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g=Duel.SelectMatchingCard(tp,c80400019.dfilter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoHand(g,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g)
		end
	end
	if ac==1 or ac==2 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
		local g=Duel.SelectTarget(tp,c80400019.dfilter,tp,LOCATION_GRAVE,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
		end
	end
end
