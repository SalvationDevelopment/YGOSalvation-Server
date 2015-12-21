--永遠の魂
function c80100303.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c80100303.eftg1)
	e1:SetOperation(c80100303.efop)
	c:RegisterEffect(e1)
	--add or spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetDescription(aux.Stringid(80100303,0))
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetCost(c80100303.cost)
	e2:SetTarget(c80100303.eftg2)
	e2:SetOperation(c80100303.efop)
	c:RegisterEffect(e2)
	--immune
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e3:SetTarget(c80100303.etarget)
	e3:SetValue(c80100303.efilter)
	c:RegisterEffect(e3)
	--destroy
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100303,1))
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetProperty(EFFECT_FLAG_DELAY)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetCondition(c80100303.descon)
	e4:SetTarget(c80100303.destg)
	e4:SetOperation(c80100303.desop)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EVENT_REMOVE)
	c:RegisterEffect(e5)
	local e6=e4:Clone()
	e6:SetCode(EVENT_TO_HAND)
	c:RegisterEffect(e6)
end
function c80100303.select(e,tp,b1,b2)
	local op=0
	if b1 and b2 then
		op=Duel.SelectOption(tp,aux.Stringid(80100303,3),aux.Stringid(80100303,4))+1
	elseif b1 then
		op=Duel.SelectOption(tp,aux.Stringid(80100303,3))+1
	else op=Duel.SelectOption(tp,aux.Stringid(80100303,4))+2 end
	e:SetLabel(op)
	if op==1 then
		e:SetCategory(CATEGORY_SPECIAL_SUMMON)
		Duel.Hint(HINT_OPSELECTED,1-tp,aux.Stringid(80100303,3))
		Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_GRAVE)
	else
		Duel.Hint(HINT_OPSELECTED,1-tp,aux.Stringid(80100303,4))
		e:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
		Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
	end
	Duel.RegisterFlagEffect(tp,80100303,RESET_PHASE+PHASE_END,0,1)
end
function c80100303.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100303)==0 end
	Duel.RegisterFlagEffect(tp,80100303,RESET_PHASE+PHASE_END,0,1)
end
function c80100303.eftg1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local b1=Duel.IsExistingMatchingCard(c80100303.filter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	local b2=Duel.IsExistingMatchingCard(c80100303.thfilter,tp,LOCATION_DECK,0,1,nil) 
	local b3=Duel.GetFlagEffect(tp,80100303)==0
	if (not b1 and not b2) or not b3 or not Duel.SelectYesNo(tp,aux.Stringid(80100303,2)) then
		e:SetProperty(0)
		e:SetCategory(0)
		e:SetLabel(0)
		return
	end
	e:SetProperty(EFFECT_FLAG_CARD_TARGET)
	c80100303.select(e,tp,b1,b2)
end
function c80100303.eftg2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local b1=Duel.IsExistingMatchingCard(c80100303.filter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	local b2=Duel.IsExistingMatchingCard(c80100303.thfilter,tp,LOCATION_DECK,0,1,nil) 
	if chk==0 then return e:GetHandler():GetFlagEffect(80100303)==0 and (b1 or b2) end
	c80100303.select(e,tp,b1,b2)
end
function c80100303.filter(c,e,tp)
	return c:IsCode(46986414) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100303.thfilter(c,e,tp)
	return (c:IsCode(2314238) or  c:IsCode(63391643) )and c:IsAbleToHand()
end
function c80100303.efop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	if e:GetLabel()==0 then return
	elseif e:GetLabel()==1 then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g=Duel.SelectMatchingCard(tp,c80100303.filter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil,e,tp)
		if g:GetCount()>0 then
			Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
		end
	else
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g=Duel.SelectMatchingCard(tp,c80100303.thfilter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoHand(g,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g)
		end
	end
end
function c80100303.etarget(e,c)
	return c:GetOwner()==e:GetHandlerPlayer() and c:IsCode(46986414)
end
function c80100303.efilter(e,te)
	return e:GetHandlerPlayer()~=te:GetHandlerPlayer()
end
function c80100303.descon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsPreviousPosition(POS_FACEUP) and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c80100303.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,LOCATION_MZONE,0,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80100303.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,LOCATION_MZONE,0,nil)
	Duel.Destroy(g,REASON_EFFECT)
end
