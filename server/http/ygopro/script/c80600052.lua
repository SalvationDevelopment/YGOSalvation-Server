--ゴーストリック・アルカード
function c80600052.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,3),2)
	c:EnableReviveLimit()
	--Cannot atk facedowns/ghostricks
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
	e1:SetTarget(c80600052.filter)
	e1:SetValue(1)
	e1:SetRange(LOCATION_MZONE)
	c:RegisterEffect(e1)
	--destory facedown
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c80600052.cost)
	e2:SetTarget(c80600052.destar)
	e2:SetOperation(c80600052.desop)
	c:RegisterEffect(e2)
	--add
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetProperty(EFFECT_FLAG_DELAY+EFFECT_FLAG_DAMAGE_STEP)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetTarget(c80600052.target)
	e3:SetOperation(c80600052.operation)
	c:RegisterEffect(e3)
end
function c80600052.filter(e,c)
	return c:IsSetCard(0x91) and c~=e:GetHandler() or c:IsFacedown()
end
function c80600052.filter2(c,e)
	return c:IsSetCard(0x91) and c~=e:GetHandler() and c:IsAbleToHand()
end

function c80600052.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600052.filter2,tp,LOCATION_GRAVE,0,1,nil,e) end
	local tc=Duel.SelectTarget(tp,c80600052.filter2,tp,LOCATION_GRAVE,0,1,1,nil,e)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,tc,1,tp,LOCATION_GRAVE)
end
function c80600052.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end
function c80600052.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600052)==0 and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	Duel.RegisterFlagEffect(tp,80600052,RESET_PHASE+PHASE_END,0,1)
end

function c80600052.desfilter(c)
	return c:IsFacedown() and c:IsDestructable()
end

function c80600052.destar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsControler(1-tp) and c80600052.desfilter(chkc) end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c80600052.desfilter,tp,0,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c80600052.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and tc:IsFacedown() then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end