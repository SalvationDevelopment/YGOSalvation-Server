--ヴァンパイア・ソーサラー
function c80600029.initial_effect(c)
	--to grave
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_DELAY+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c80600029.condition)
	e1:SetTarget(c80600029.target)
	e1:SetOperation(c80600029.operation)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80600029,0))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCost(c80600029.ntcost)
	e2:SetOperation(c80600029.ntop)
	c:RegisterEffect(e2)
end
function c80600029.condition(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and (e:GetHandler():IsReason(REASON_EFFECT) or e:GetHandler():IsReason(REASON_BATTLE))
end
function c80600029.filter(c)
	return (
			c:IsAttribute(ATTRIBUTE_DARK) or 
			c:IsType(TYPE_SPELL) or 
			c:IsType(TYPE_TRAP)
			) 
			and c:IsAbleToHand()  and c:IsSetCard(0x92)
end
function c80600029.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600029.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80600029.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80600029.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end


function c80600029.ntcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return  e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end

function c80600029.ntop(e,tp,eg,ep,ev,re,r,rp)
local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_DECREASE_TRIBUTE)
	e1:SetTargetRange(LOCATION_HAND,0)
	e1:SetTarget(c80600029.rfilter)
	e1:SetCountLimit(1)
	e1:SetValue(0x2)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end

function c80600029.rfilter(e,c)
	return c:IsSetCard(0x92)
end
