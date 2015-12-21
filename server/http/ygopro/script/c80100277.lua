--Blaze Accelerator Magazine
function c80100277.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,0x1c0+TIMING_MAIN_END)
	e1:SetTarget(c80100277.actg)
	e1:SetOperation(c80100277.acop)
	c:RegisterEffect(e1)
	--handes
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100277,0))
	e2:SetCategory(CATEGORY_HANDES+CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_SZONE)
	e2:SetHintTiming(0,0x1c0+TIMING_MAIN_END)
	e2:SetCountLimit(1,80100277)
	e2:SetCost(c80100277.sccost)
	e2:SetCondition(c80100277.sccon)
	e2:SetTarget(c80100277.target)
	e2:SetOperation(c80100277.operation)
	c:RegisterEffect(e2)
	--banish and foolish
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100277,1))
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetHintTiming(0,0x1c0+TIMING_MAIN_END)
	e3:SetCondition(c80100277.sccon)
	e3:SetCost(c80100277.dmpcost)
	e3:SetTarget(c80100277.dmptg)
	e3:SetOperation(c80100277.dmpop)
	c:RegisterEffect(e3)
	--name
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetCode(EFFECT_CHANGE_CODE)
	e4:SetRange(LOCATION_SZONE)
	e4:SetValue(21420702)
	c:RegisterEffect(e4)
end
function c80100277.actg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local ph=Duel.GetCurrentPhase()
	local b1=Duel.IsPlayerCanDraw(tp,1)	and Duel.IsExistingMatchingCard(c80100277.filter,tp,LOCATION_HAND,0,1,nil)
			and bit.band(ph,PHASE_MAIN1+PHASE_MAIN2)~=0
			and Duel.GetFlagEffect(tp,80100277)==0
	if b1  and Duel.SelectYesNo(tp,aux.Stringid(80100277,2)) then
		e:SetLabel(1)
		Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_HAND)
		Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
		Duel.RegisterFlagEffect(tp,80100277,RESET_PHASE+PHASE_END,0,1)
	else 
		e:SetLabel(0)
	end
end
function c80100277.acop(e,tp,eg,ep,ev,re,r,rp)
	local opt=e:GetLabel()
	if opt==0 or not e:GetHandler():IsRelateToEffect(e) then return end
	if Duel.DiscardHand(tp,c80100277.filter,1,1,REASON_EFFECT)~=0 then
		Duel.Draw(tp,1,REASON_EFFECT)
	end
end
function c80100277.sccon(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	return bit.band(ph,PHASE_MAIN1+PHASE_MAIN2)~=0
end
function c80100277.sccost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100277)==0 end
	Duel.RegisterFlagEffect(tp,80100277,RESET_PHASE+PHASE_END,0,1)
end
function c80100277.filter(c)
	return c:IsSetCard(0x32) and c:IsType(TYPE_MONSTER)
end
function c80100277.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1)
		and Duel.IsExistingMatchingCard(c80100277.filter,tp,LOCATION_HAND,0,1,nil) end
	Duel.RegisterFlagEffect(tp,80100277,RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_HAND)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c80100277.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	if Duel.DiscardHand(tp,c80100277.filter,1,1,REASON_EFFECT)~=0 then
		Duel.Draw(tp,1,REASON_EFFECT)
	end
end
function c80100277.dmpcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c80100277.dmpfilter(c)
	return c:IsSetCard(0x32) and c:IsType(TYPE_MONSTER) and c:IsAbleToGrave()
end
function c80100277.dmptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c80100277.dmpop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c80100277.dmpfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoGrave(g,REASON_EFFECT)
	end
end

