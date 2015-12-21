--Butterfly Effect FIX
function c73310000.initial_effect(c)
	Duel.EnableGlobalFlag(GLOBALFLAG_DECK_REVERSE_CHECK)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--Upside down
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_REVERSE_DECK)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_FZONE)
	e2:SetTargetRange(1,1)
	c:RegisterEffect(e2)
        --Shuffle
        local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(73310000,0))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_FZONE)
	e3:SetProperty(EFFECT_FLAG_BOTH_SIDE)
	e3:SetCountLimit(1)
	e3:SetCost(c73310000.cost)
	e3:SetOperation(c73310000.operation)
	c:RegisterEffect(e3)
end
function c73310000.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,500) end
	Duel.PayLPCost(tp,500)
end
function c73310000.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local opt=Duel.SelectOption(tp,aux.Stringid

(73310000,1),aux.Stringid(73310000,2))
	if opt==0 then 
		Duel.ShuffleDeck(tp)
	else
		Duel.ShuffleDeck(1-tp)
	end
end