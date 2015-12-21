--帝王の開岩
function c80600067.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--spsummon limit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80600067.sumlimit)
	c:RegisterEffect(e2)
	--add
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80600067,0))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCondition(c80600067.shcon)
	e3:SetCost(c80600067.shcost)
	e3:SetTarget(c80600067.shtg)
	e3:SetOperation(c80600067.shop)
	c:RegisterEffect(e3)
end

function c80600067.sumlimit(e,c,sump,sumtype,sumpos,targetp)
	return c:IsLocation(LOCATION_EXTRA)
end

function c80600067.shcon(e,tp,eg,ep,ev,re,r,rp)
	local ec=eg:GetFirst()
	e:SetLabelObject(ec)
	return ec:IsControler(tp) and bit.band(ec:GetSummonType(),SUMMON_TYPE_ADVANCE)==SUMMON_TYPE_ADVANCE
end
function c80600067.shcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600067)==0 and e:GetHandler():IsRelateToEffect(e) end
	Duel.RegisterFlagEffect(tp,80600067,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80600067.filter(c,atk,code)
	return  c:IsType(TYPE_MONSTER) and
			c:GetAttack()==atk and c:GetDefence() == 1000 
			and c:IsAbleToHand() and not c:IsCode(code)
end
function c80600067.shtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then 
	local se=0
	if 	Duel.IsExistingMatchingCard(c80600067.filter,tp,LOCATION_DECK,0,1,nil,2400,e:GetLabelObject():GetCode()) then
	se= se+1
	end
	if 	Duel.IsExistingMatchingCard(c80600067.filter,tp,LOCATION_DECK,0,1,nil,2800,e:GetLabelObject():GetCode()) then
	se= se+2
	end
	e:SetLabel(se)
	return se~=0
	end
	local se=e:GetLabel()
	if se==3 then
		Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(80600067,0))
		se=Duel.SelectOption(tp,aux.Stringid(80600067,1),aux.Stringid(80600067,2))+1
	end
	if se==2 then
		e:SetLabel(2800)
	else 
		e:SetLabel(2400)
	end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80600067.shop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80600067.filter,tp,LOCATION_DECK,0,1,1,nil,e:GetLabel(),e:GetLabelObject():GetCode())
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
